// Merge the xlsx DAYS narrative (tools/create-excel.js) into js/data.js so the app
// has everything the printable guide has: time, duration, narrative, activity kind,
// wake-up + depart time, and recommendations.
//
// Strategy
//  - Parse the DAYS const from create-excel.js (safe eval inside a sandbox).
//  - For each day, build day.schedule[] with one entry per xlsx row.
//  - For stop/walk/hike/tour rows, try to match a data.js stop by name fuzzy-match:
//      * extract the leading noun phrase up to " — "
//      * normalize (lowercase, strip " utah"/" arizona", remove punctuation)
//      * find the best-scoring data.js stop on the same day (Jaccard on tokens)
//  - On match: set schedule[i].stopId = matched stop id. That gives the renderer coords.
//  - On non-match: schedule[i] has no stopId — it's narrative only.
//  - day.wakeup and day.depart copied verbatim.
//  - Recommendations sheet ported into TRIP_DATA.recommendations.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_PATH  = path.join(__dirname, '..', 'js', 'data.js');
const EXCEL_PATH = path.join(__dirname, 'create-excel.js');

const excelSrc = fs.readFileSync(EXCEL_PATH, 'utf8');
const daysMatch = excelSrc.match(/const DAYS = (\[[\s\S]*?\]);\s*\n\/\//);
if (!daysMatch) { console.error('Could not locate DAYS array'); process.exit(1); }
const DAYS = vm.runInNewContext('(' + daysMatch[1] + ')', {});

const recsMatch = excelSrc.match(/const recs = (\[[\s\S]*?\]);\s*\n\s*for \(const rec of recs\)/);
if (!recsMatch) { console.error('Could not locate recs array'); process.exit(1); }
const RECS = vm.runInNewContext('(' + recsMatch[1] + ')', {});

const TRIP = require(DATA_PATH);

// --- helpers ---
function norm(s) {
  return (s || '').toLowerCase()
    .replace(/[()'"""'.,!?:;]/g, '')
    .replace(/ utah\b| arizona\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function tokens(s) { return new Set(norm(s).split(' ').filter(w => w.length > 2)); }
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let i = 0; for (const x of a) if (b.has(x)) i++;
  return i / (a.size + b.size - i);
}

// Pull the "headline" from an xlsx text: the phrase before " — " or ":" or "."
function headline(text) {
  if (!text) return '';
  const m = text.match(/^([^—:.\n]+?)(?:\s+—\s+|:| \()/);
  return (m ? m[1] : text).trim();
}

// Map xlsx row type → activity kind in schedule.
const KIND = {
  driving:'driving', stop:'stop', walk:'walk', hike:'hike', tour:'tour',
  add:'add', note:'note', keep:'sleep', cancel:'cancel'
};

// Convert duration strings like "1.5 hrs", "45 min", "2–4 hrs" to minutes (midpoint).
function parseDuration(d) {
  if (!d) return null;
  const s = d.toLowerCase().replace(/~/g,'').replace(/\s+/g,' ').trim();
  const hrM = s.match(/([\d.]+)(?:\s*[–-]\s*([\d.]+))?\s*hr/);
  if (hrM) {
    const a = parseFloat(hrM[1]), b = hrM[2] ? parseFloat(hrM[2]) : a;
    return Math.round((a + b) / 2 * 60);
  }
  const minM = s.match(/([\d.]+)(?:\s*[–-]\s*([\d.]+))?\s*min/);
  if (minM) {
    const a = parseFloat(minM[1]), b = minM[2] ? parseFloat(minM[2]) : a;
    return Math.round((a + b) / 2);
  }
  return null;
}

let matched = 0, unmatched = 0;

for (const xd of DAYS) {
  const day = TRIP.days.find(d => d.dayNumber === xd.day);
  if (!day) { console.log(`  skip day ${xd.day} (no data.js entry)`); continue; }

  day.wakeup = xd.wakeup || null;
  day.depart = xd.depart || null;

  const usedIds = new Set();
  const schedule = [];

  for (const act of xd.activities) {
    const kind = KIND[act.type] || 'note';
    const item = {
      time: act.time || null,
      duration: act.duration || null,
      durationMin: parseDuration(act.duration),
      kind,
      text: act.text,
      route: act.route || null,
    };

    // Only try to match location-bearing rows.
    if (['stop','walk','hike','tour'].includes(act.type)) {
      const hl = headline(act.text);
      const htoks = tokens(hl);
      let best = null, bestScore = 0;
      for (const s of (day.stops || [])) {
        if (usedIds.has(s.id)) continue;
        const score = jaccard(tokens(s.name), htoks);
        if (score > bestScore) { bestScore = score; best = s; }
      }
      // Also try whole-text contains (for bundled "Windows section" → matches Turret, Double, etc.)
      if (bestScore < 0.3) {
        const textNorm = norm(act.text);
        for (const s of (day.stops || [])) {
          if (usedIds.has(s.id)) continue;
          if (textNorm.includes(norm(s.name))) { best = s; bestScore = 1; break; }
        }
      }
      if (best && bestScore >= 0.3) {
        item.stopId = best.id;
        usedIds.add(best.id);
        matched++;
      } else {
        unmatched++;
      }
    }

    schedule.push(item);
  }

  // Any data.js stops with coords not referenced by the schedule: append as narrative-less entries
  // so the map still plots them and the count matches.
  for (const s of (day.stops || [])) {
    if (usedIds.has(s.id)) continue;
    schedule.push({
      time: null,
      duration: null,
      durationMin: null,
      kind: 'stop',
      text: null, // no narrative — the renderer will fall back to the stop name + tip
      stopId: s.id,
      orphan: true,
    });
  }

  day.schedule = schedule;
}

// Port recommendations. Each section header comes in as { _s: 'header' }.
const recommendations = [];
let section = null;
for (const r of RECS) {
  if (r._s) { section = r._s; continue; }
  recommendations.push({
    section,
    priority: r.p,
    kind: r.t,
    when: r.w,
    name: r.n,
    why: r.y,
    action: r.a,
    lat: r.lat || null,
    lng: r.lng || null,
  });
}
TRIP.recommendations = recommendations;

// Serialize. TRIP_DATA is an object literal; preserve top-level keys and day shape.
const out = 'const TRIP_DATA = ' + JSON.stringify(TRIP, null, 2) + ';\n\n' +
            "if (typeof module !== 'undefined') module.exports = TRIP_DATA;\n";
fs.writeFileSync(DATA_PATH, out);

console.log(`Merged. Matched ${matched} rows to stops, ${unmatched} narrative-only rows, ${recommendations.length} recommendations ported.`);
console.log('Sample Day 2 schedule length:', TRIP.days[1].schedule.length);
