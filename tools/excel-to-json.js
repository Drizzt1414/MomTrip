#!/usr/bin/env node
/**
 * Excel-to-JSON converter for Mom's US Canyon Trip
 * Parses US Trip.xlsx → js/data.js with audit metadata
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const INPUT = process.argv[2] || 'C:/Users/oreny/Downloads/US Trip.xlsx';
const OUTPUT_DATA = path.join(__dirname, '..', 'js', 'data.js');
const OUTPUT_AUDIT = path.join(__dirname, '..', 'data', 'audit-results.json');

// --- Utility functions ---

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function parseCoords(coordStr) {
  if (!coordStr || coordStr === '?' || coordStr.includes('לא')) return null;
  // Handle "lat, lng" format
  const parts = coordStr.toString().replace(/[^\d.,\s-]/g, '').split(/[,\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }
  return null;
}

function titleCase(str) {
  if (!str) return '';
  return str.trim().replace(/\b\w/g, c => c.toUpperCase());
}

function guessEmoji(name, type) {
  const n = (name || '').toLowerCase();
  if (type === 'Sleep') return '🏨';
  if (type === 'Park Entry') return '🎟️';
  if (n.includes('airport')) return '✈️';
  if (n.includes('visitor center')) return '🏛️';
  if (n.includes('arch') || n.includes('bridge')) return '🌉';
  if (n.includes('canyon') || n.includes('gorge') || n.includes('wash')) return '🏜️';
  if (n.includes('overlook') || n.includes('viewpoint') || n.includes('point')) return '👀';
  if (n.includes('trail') || n.includes('hike') || n.includes('loop') || n.includes('walk')) return '🥾';
  if (n.includes('rock') || n.includes('dome') || n.includes('tower')) return '🪨';
  if (n.includes('falls') || n.includes('creek') || n.includes('river') || n.includes('lake') || n.includes('reservoir')) return '💧';
  if (n.includes('garden') || n.includes('forest')) return '🌲';
  if (n.includes('cave') || n.includes('slot') || n.includes('narrows')) return '🕳️';
  if (n.includes('mountain') || n.includes('peak') || n.includes('hill')) return '⛰️';
  if (n.includes('dam')) return '🏗️';
  if (n.includes('museum') || n.includes('historic')) return '🏛️';
  if (n.includes('campground') || n.includes('rv')) return '⛺';
  if (n.includes('motel') || n.includes('hotel') || n.includes('inn') || n.includes('resort') || n.includes('suites')) return '🏨';
  if (n.includes('casino')) return '🎰';
  if (n.includes('sunset') || n.includes('sunrise')) return '🌅';
  return '📍';
}

function classifyDifficulty(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('overlook') || n.includes('viewpoint') || n.includes('point') || n.includes('pullout')) return 'Easy (viewpoint)';
  if (n.includes('slot') || n.includes('narrows') || n.includes('scramble')) return 'Moderate-Hard';
  if (n.includes('loop') && (n.includes('primitive') || n.includes('canyon'))) return 'Moderate';
  if (n.includes('trail') || n.includes('hike') || n.includes('walk')) return 'Easy-Moderate';
  return '';
}

// --- Known audit issues (from research) ---
const KNOWN_ISSUES = {
  'sulphur creek route': { severity: 'critical', issue: 'Coordinates point to Vernal, UT (~130 mi off). Should be ~(38.29, -111.25) in Capitol Reef.', suggestedCoords: { lat: 38.29, lng: -111.25 } },
  'goosenecks overlook': { severity: 'warning', issue: 'Day 12 uses Canyonlands coords. Capitol Reef Goosenecks Overlook is at ~(38.21, -111.16). Check which one is intended for this day.', suggestedCoords: { lat: 38.21, lng: -111.16 }, daySpecific: 12 },
  'deer creek': { severity: 'critical', issue: 'Coordinates point to Provo/SLC area (~150 mi off). Does not belong on a Capitol Reef day.', suggestedCoords: null },
  'carmel canyon loop': { severity: 'critical', issue: 'Coordinates point to St. George (~170 mi off). Should be ~(38.57, -110.70) in Goblin Valley.', suggestedCoords: { lat: 38.57, lng: -110.70 } },
  'south of hanksville': { severity: 'critical', issue: 'Not a real place name. No navigable destination.' },
  'cosmic ash hills walk': { severity: 'critical', issue: 'No such trail exists. No coordinates available.' },
  'petrified logs kanarra falls': { severity: 'critical', issue: 'Place does not exist. Petrified logs are at Escalante Petrified Forest, not Kanarra Falls.' },
  'seven wonders kanarra falls': { severity: 'critical', issue: 'Place does not exist. "Seven Wonders" is at Valley of Fire State Park, not Kanarra Falls.' },
  'white hoodoos arizona': { severity: 'critical', issue: 'Cannot be found. Possibly confused with White Pocket (which is on day 21).' },
  'glen canyon trail arizona': { severity: 'critical', issue: 'No such trail exists near Glen Canyon.' },
  'switchbacks capitol reef': { severity: 'warning', issue: 'No coordinates. Likely refers to Burr Trail switchbacks ~(37.84, -111.04).', suggestedCoords: { lat: 37.84, lng: -111.04 } },
  'cottonwood wash route capitol reef': { severity: 'warning', issue: 'No coordinates. Not a formally established trail. Approximate area: ~(38.25, -111.15).', suggestedCoords: { lat: 38.25, lng: -111.15 } },
  'rainbow hills loop': { severity: 'critical', issue: 'Coordinates ~80 mi from Hanksville area. Trail name is not well-established.' },
  'big water arizona': { severity: 'critical', issue: 'Big Water is in UTAH, not Arizona. Coordinates also wrong (~100 mi off). Should be ~(37.07, -111.66).', suggestedCoords: { lat: 37.07, lng: -111.66 } },
  'stud horse point arizona': { severity: 'warning', issue: 'Coordinates ~16 mi off. Should be ~(36.99, -111.87).', suggestedCoords: { lat: 36.99, lng: -111.87 } },
};

const SPELLING_FIXES = {
  'courthose towers viewpoint': 'Courthouse Towers Viewpoint',
  'courthose towers': 'Courthouse Towers',
  'fermont gorge overlook': 'Fremont Gorge Overlook',
  'farensworth canyon': 'Farnsworth Canyon',
  'sixst in las vagas airport': 'Las Vegas Airport (LAS)',
  'onderosa bryce canyon': 'Ponderosa Canyon Bryce Canyon',
  'frying pantrail': 'Frying Pan Trail',
};

// --- Parse Excel ---

console.log(`Reading ${INPUT}...`);
const wb = XLSX.readFile(INPUT);
const ws = wb.Sheets['US Canyon Trip'];
if (!ws) {
  console.error('Sheet "US Canyon Trip" not found!');
  process.exit(1);
}

const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Skip header rows (first 2)
const dataRows = rows.slice(2).filter(r => {
  // Keep rows that have at least a place name or coordinates
  return r.some(cell => cell != null && cell !== '');
});

// Hebrew titles for known areas
const TITLE_HE_MAP = {
  'arches national park': 'פארק ארצ\'ס',
  'canyolands': 'קניונלנדס',
  'canyonlands': 'קניונלנדס',
  'bentonite hills': 'גבעות בנטונייט',
  'goblin valley': 'עמק הגובלינים',
  'little horse canyon': 'קניון ליטל הורס',
  'capitol reef': 'קפיטול ריף',
  'hole in the rock': 'חור בסלע',
  'zion canyon': 'ציון',
  'nevada': 'נבאדה',
};

// --- Build trip structure ---

const trip = {
  name: "US Canyon Trip 2026",
  nameHe: "טיול הקניונים 2026",
  startDate: "2026-05-05",
  endDate: "2026-06-01",
  totalDays: 28,
};

const days = [];
const auditIssues = [];
let currentDay = null;

// Parse the sheet structure:
// Columns: Maps, (empty), Comments(From), date, Canyon Name, Type, Name(From), Coordinates(From), Type(To), Name(To), Coordinates(To), Comments(To), Residence Link, Residence Address, Phone, Website Coords
// Col indices: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15

for (const row of dataRows) {
  const comments = (row[2] || '').toString().trim();
  const dateVal = row[3];
  const canyonName = (row[4] || '').toString().trim();
  const fromType = (row[5] || '').toString().trim();
  const fromName = (row[6] || '').toString().trim();
  const fromCoords = (row[7] || '').toString().trim();
  const toType = (row[8] || '').toString().trim();
  const toName = (row[9] || '').toString().trim();
  const toCoords = (row[10] || '').toString().trim();
  const toComments = (row[11] || '').toString().trim();
  const residenceLink = (row[12] || '').toString().trim();
  const residenceAddr = (row[13] || '').toString().trim();
  const residencePhone = (row[14] || '').toString().trim();
  const residenceWebCoords = (row[15] || '').toString().trim();

  // New day?
  if (dateVal && !isNaN(parseFloat(dateVal))) {
    const rawDateStr = dateVal.toString();
    const dayNum = Math.floor(parseFloat(rawDateStr.replace(/\s*\(.*\)/, ''))) - 4; // 5.5 → day 1, 6.5 → day 2

    // Calculate actual date
    const baseDate = new Date('2026-05-05');
    const actualDate = new Date(baseDate);
    actualDate.setDate(actualDate.getDate() + dayNum - 1);
    const dateFormatted = actualDate.toISOString().split('T')[0];

    // Check if this is an option variant (like "18.5 (option 2 - rain)")
    const isOption2 = rawDateStr.includes('option 2');

    // Check if we already have this day number
    const existingDay = days.find(d => d.dayNumber === dayNum);

    if (existingDay && isOption2) {
      // This is the rain option — store as alternative
      if (!existingDay.optionB) {
        existingDay.optionB = { label: rawDateStr, stops: [] };
      }
      currentDay = existingDay; // Continue adding to same day
      currentDay._addingToOptionB = true;
    } else if (!existingDay) {
      const titleEn = titleCase(canyonName) || '';
      const titleHe = TITLE_HE_MAP[(canyonName || '').toLowerCase()] || '';
      currentDay = {
        dayNumber: dayNum,
        date: dateFormatted,
        title: titleEn,
        titleHe: titleHe,
        region: '',
        hotel: null,
        stops: [],
        optionB: null,
        comments: comments || '',
        _addingToOptionB: false,
      };
      days.push(currentDay);
    } else {
      // Same day number, not option 2 — just continue adding
      currentDay = existingDay;
      currentDay._addingToOptionB = false;
    }
  }

  if (!currentDay) continue;

  // Add "from" place as a stop
  if (fromName && fromName !== 'Oren') {
    const coords = parseCoords(fromCoords);
    const cleanName = fromName.trim();
    const lowerName = cleanName.toLowerCase();

    // Check for spelling fixes
    const fixedName = SPELLING_FIXES[lowerName] || titleCase(cleanName);
    const spellingIssue = SPELLING_FIXES[lowerName] ? `Spelling corrected: "${cleanName}" → "${SPELLING_FIXES[lowerName]}"` : null;

    // Check for known issues
    const knownKey = Object.keys(KNOWN_ISSUES).find(k => lowerName.includes(k));
    const knownIssue = knownKey ? KNOWN_ISSUES[knownKey] : null;

    // Build audit info
    const audit = { status: 'verified', issues: [], suggestedCoords: null };

    if (!coords && fromCoords !== '') {
      audit.status = 'error';
      audit.issues.push('Coordinates are missing or invalid (marked as "?")');
    } else if (!coords && fromCoords === '') {
      // No coords field at all — might be fine for some entries
      if (fromType !== 'Sleep' && !lowerName.includes('organized trip') && !lowerName.includes('vegas trip')) {
        audit.status = 'warning';
        audit.issues.push('No coordinates provided');
      }
    }

    if (knownIssue) {
      audit.status = knownIssue.severity === 'critical' ? 'error' : 'warning';
      audit.issues.push(knownIssue.issue);
      if (knownIssue.suggestedCoords) {
        audit.suggestedCoords = knownIssue.suggestedCoords;
      }
    }

    if (spellingIssue) {
      if (audit.status === 'verified') audit.status = 'warning';
      audit.issues.push(spellingIssue);
    }

    // Check mom's own comments for flags
    if (comments.includes('לא קיים') || comments.includes('לא מוצאת') || toComments.includes('לא קיים') || toComments.includes('לא מוצאת')) {
      // Already handled in known issues for most cases
    }

    const stop = {
      id: `d${currentDay.dayNumber}-s${currentDay.stops.length + 1}`,
      name: fixedName,
      nameOriginal: cleanName !== fixedName ? cleanName : undefined,
      emoji: guessEmoji(cleanName, fromType),
      type: fromType || 'Park Sight',
      coordinates: coords,
      tip: comments || '',
      difficulty: classifyDifficulty(cleanName),
      audit,
    };

    // Is this a sleep/hotel entry?
    if (fromType === 'Sleep' || lowerName.includes('sleep')) {
      currentDay.hotel = {
        name: fixedName,
        coordinates: coords,
        address: residenceAddr || '',
        phone: residencePhone || '',
        bookingLink: residenceLink || '',
      };
    } else {
      currentDay.stops.push(stop);
    }
  }

  // Add "to" place as a stop
  if (toName && toName !== 'Oren' && !toName.includes('no further details')) {
    const coords = parseCoords(toCoords);
    const cleanName = toName.trim();
    const lowerName = cleanName.toLowerCase();

    const fixedName = SPELLING_FIXES[lowerName] || titleCase(cleanName);
    const spellingIssue = SPELLING_FIXES[lowerName] ? `Spelling corrected: "${cleanName}" → "${SPELLING_FIXES[lowerName]}"` : null;

    const knownKey = Object.keys(KNOWN_ISSUES).find(k => lowerName.includes(k));
    const knownIssue = knownKey ? KNOWN_ISSUES[knownKey] : null;

    const audit = { status: 'verified', issues: [], suggestedCoords: null };

    if (!coords && toCoords !== '' && toCoords !== '') {
      audit.status = 'error';
      audit.issues.push('Coordinates are missing or invalid');
    } else if (!coords) {
      if (toType !== 'Sleep' && !lowerName.includes('organized trip')) {
        audit.status = 'warning';
        audit.issues.push('No coordinates provided');
      }
    }

    if (knownIssue) {
      audit.status = knownIssue.severity === 'critical' ? 'error' : 'warning';
      audit.issues.push(knownIssue.issue);
      if (knownIssue.suggestedCoords) {
        audit.suggestedCoords = knownIssue.suggestedCoords;
      }
    }

    if (spellingIssue) {
      if (audit.status === 'verified') audit.status = 'warning';
      audit.issues.push(spellingIssue);
    }

    if (toType === 'Sleep') {
      currentDay.hotel = {
        name: fixedName,
        coordinates: coords,
        address: residenceAddr || '',
        phone: residencePhone || '',
        bookingLink: residenceLink || '',
      };
    } else {
      const stop = {
        id: `d${currentDay.dayNumber}-s${currentDay.stops.length + 1}`,
        name: fixedName,
        nameOriginal: cleanName !== fixedName ? cleanName : undefined,
        emoji: guessEmoji(cleanName, toType),
        type: toType || 'Park Sight',
        coordinates: coords,
        tip: toComments || '',
        difficulty: classifyDifficulty(cleanName),
        audit,
      };
      currentDay.stops.push(stop);
    }
  }
}

// --- Post-processing: distance sanity checks ---

for (const day of days) {
  for (let i = 1; i < day.stops.length; i++) {
    const prev = day.stops[i - 1];
    const curr = day.stops[i];
    if (prev.coordinates && curr.coordinates) {
      const dist = haversineDistance(
        prev.coordinates.lat, prev.coordinates.lng,
        curr.coordinates.lat, curr.coordinates.lng
      );
      curr.audit.distFromPrev = Math.round(dist * 10) / 10;
      if (dist > 150) {
        curr.audit.distSanity = 'impossible';
        if (curr.audit.status === 'verified') curr.audit.status = 'warning';
        curr.audit.issues.push(`Distance from previous stop is ${Math.round(dist)} miles — likely wrong coordinates`);
      } else if (dist > 80) {
        curr.audit.distSanity = 'suspicious';
        if (curr.audit.status === 'verified') curr.audit.status = 'warning';
        curr.audit.issues.push(`Distance from previous stop is ${Math.round(dist)} miles — check route`);
      } else {
        curr.audit.distSanity = 'ok';
      }
    }
  }
}

// --- Coordinate bounds check (Utah/Arizona: ~36-42°N, ~108-115°W) ---

for (const day of days) {
  for (const stop of day.stops) {
    if (stop.coordinates) {
      const { lat, lng } = stop.coordinates;
      if (lat < 35 || lat > 42 || lng < -116 || lng > -108) {
        if (stop.audit.status === 'verified') stop.audit.status = 'warning';
        stop.audit.issues.push(`Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)}) are outside Utah/Arizona bounds`);
      }
    }
  }
}

// --- Collect all audit issues ---

for (const day of days) {
  for (const stop of day.stops) {
    if (stop.audit.issues.length > 0) {
      auditIssues.push({
        dayNumber: day.dayNumber,
        dayDate: day.date,
        dayTitle: day.title,
        stopId: stop.id,
        stopName: stop.name,
        nameOriginal: stop.nameOriginal,
        severity: stop.audit.status,
        issues: stop.audit.issues,
        coordinates: stop.coordinates,
        suggestedCoords: stop.audit.suggestedCoords,
      });
    }
  }
}

// --- Deduplicate consecutive stops with same name ---

for (const day of days) {
  const seen = new Set();
  day.stops = day.stops.filter(stop => {
    const key = stop.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Re-index IDs
  day.stops.forEach((stop, i) => {
    stop.id = `d${day.dayNumber}-s${i + 1}`;
  });
}

// --- Generate stats ---

let totalStops = 0;
let verified = 0;
let warnings = 0;
let errors = 0;

for (const day of days) {
  totalStops += day.stops.length;
  for (const stop of day.stops) {
    if (stop.audit.status === 'verified') verified++;
    else if (stop.audit.status === 'warning') warnings++;
    else if (stop.audit.status === 'error') errors++;
  }
}

const stats = { totalDays: days.length, totalStops, verified, warnings, errors };

console.log(`\n📊 Trip Stats:`);
console.log(`   Days: ${stats.totalDays}`);
console.log(`   Total stops: ${stats.totalStops}`);
console.log(`   ✅ Verified: ${stats.verified}`);
console.log(`   ⚠️  Warnings: ${stats.warnings}`);
console.log(`   ❌ Errors: ${stats.errors}`);
console.log(`   Issues found: ${auditIssues.length}`);

// --- Write data.js ---

const dataContent = `// Auto-generated from US Trip.xlsx — ${new Date().toISOString()}
// DO NOT EDIT MANUALLY — re-run tools/excel-to-json.js to regenerate

const TRIP_DATA = ${JSON.stringify({ trip, days, stats }, null, 2)};

// Make available as module or global
if (typeof module !== 'undefined') module.exports = TRIP_DATA;
`;

fs.writeFileSync(OUTPUT_DATA, dataContent, 'utf8');
console.log(`\n✅ Written ${OUTPUT_DATA}`);

// --- Write audit results ---

const auditContent = {
  generatedAt: new Date().toISOString(),
  stats,
  issues: auditIssues,
};

fs.writeFileSync(OUTPUT_AUDIT, JSON.stringify(auditContent, null, 2), 'utf8');
console.log(`✅ Written ${OUTPUT_AUDIT}`);

// --- Print critical issues ---

console.log(`\n🚨 CRITICAL ISSUES (${errors} errors):\n`);
for (const issue of auditIssues.filter(i => i.severity === 'error')) {
  console.log(`  Day ${issue.dayNumber} | ${issue.stopName}`);
  for (const msg of issue.issues) {
    console.log(`    ❌ ${msg}`);
  }
  if (issue.suggestedCoords) {
    console.log(`    💡 Suggested: (${issue.suggestedCoords.lat}, ${issue.suggestedCoords.lng})`);
  }
  console.log();
}

console.log(`⚠️  WARNINGS (${warnings}):\n`);
for (const issue of auditIssues.filter(i => i.severity === 'warning')) {
  console.log(`  Day ${issue.dayNumber} | ${issue.stopName}`);
  for (const msg of issue.issues) {
    console.log(`    ⚠️  ${msg}`);
  }
  console.log();
}
