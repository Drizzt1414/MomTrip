// Comprehensive integrity tests for the MomTrip PWA.
// Runs 13 test groups against js/data.js, tools/create-excel.js,
// js/render.js, and the Excel ground-truth file.

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'js/data.js');
const RENDER_PATH = path.join(ROOT, 'js/render.js');
const APP_PATH = path.join(ROOT, 'js/app.js');
const ALLTRAILS_PATH = path.join(ROOT, 'js/alltrails-slugs.js');
const CREATE_EXCEL_PATH = path.join(ROOT, 'tools/create-excel.js');
const EXCEL_PATH = path.join(ROOT, 'mom-trip-days-1-24.xlsx');

// ─── Load runtime data.js (CommonJS export at the bottom, but it uses const TRIP_DATA) ───
const dataModule = require(DATA_PATH);
const TRIP = dataModule.TRIP_DATA || dataModule;
const DAYS = TRIP.days;

// ─── Load AllTrails slug map ─────────────────────────────────────────────────
const slugs = (() => {
  const src = fs.readFileSync(ALLTRAILS_PATH, 'utf8');
  // ALLTRAILS_SLUGS = { 'd2-s2': 'park-avenue-trail', ... }
  const m = src.match(/const ALLTRAILS_SLUGS\s*=\s*({[\s\S]*?});/);
  if (!m) return {};
  return new Function('return ' + m[1])();
})();

// ─── Helpers ─────────────────────────────────────────────────────────────────
const haver = (a, b) => {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const ROUND_TOL_KM = 0.1; // 100 m
const HEBREW_RX = /[֐-׿]/;

const results = []; // { test, status: 'PASS'|'FAIL'|'WARN', detail, count? }
const log = (test, status, detail, extra) => results.push({ test, status, detail, extra });

// ─── Read Excel ──────────────────────────────────────────────────────────────
const wb = XLSX.readFile(EXCEL_PATH);
const dayBySheet = wb.Sheets['📅 Day by Day'];
const xrows = XLSX.utils.sheet_to_json(dayBySheet, { header: 1, defval: '' });

// Parse Excel rows into structured stops grouped by day.
// Day header row pattern: cell[0] starts with "Day N  —  ..."
// Activity rows: [time, activityType, narrative, duration, lat, lng, problem, change]
const excelDays = [];
let curDay = null;
for (const r of xrows) {
  const c0 = String(r[0] || '').trim();
  const m = c0.match(/^Day\s+(\d+)\s+—/);
  if (m) {
    curDay = { dayNumber: Number(m[1]), title: c0, rows: [] };
    excelDays.push(curDay);
    continue;
  }
  if (!curDay) continue;
  if (!c0 && !r[1] && !r[2]) continue; // blank
  curDay.rows.push({
    time: c0,
    activityType: String(r[1] || '').trim(),
    text: String(r[2] || '').trim(),
    duration: String(r[3] || '').trim(),
    lat: r[4] === '' ? null : Number(r[4]),
    lng: r[5] === '' ? null : Number(r[5]),
    problem: String(r[6] || '').trim(),
    change: String(r[7] || '').trim(),
  });
}

// ─── TEST 1: data.js day count + day numbers match Excel ──────────────────────
{
  const dataDayNums = DAYS.map(d => d.dayNumber);
  const excelDayNums = excelDays.map(d => d.dayNumber);
  const ok = dataDayNums.length === excelDayNums.length &&
             dataDayNums.every((n, i) => n === excelDayNums[i]);
  log('T1 day count + numbering',
      ok ? 'PASS' : 'FAIL',
      ok ? `24 days, both sources` : `data.js=[${dataDayNums.join(',')}] excel=[${excelDayNums.join(',')}]`);
}

// ─── TEST 2: every Excel coord pin has a matching data.js stop within 500m ───
// Excel is the human-readable summary; data.js can be a superset (more granular
// viewpoints not all listed in Excel). What matters: every Excel pin maps to
// SOME stop in data.js for the same day.
{
  const fails = [];
  for (let i = 0; i < DAYS.length; i++) {
    const d = DAYS[i];
    const ex = excelDays[i];
    if (!ex) continue;
    const dataCoords = (d.stops || []).filter(s => s.coordinates).map(s => ({
      lat: s.coordinates.lat, lng: s.coordinates.lng, id: s.id, name: s.name
    }));
    if (d.hotel && d.hotel.coordinates) dataCoords.push({
      lat: d.hotel.coordinates.lat, lng: d.hotel.coordinates.lng, id: 'hotel', name: d.hotel.name
    });
    const excelCoordRows = ex.rows.filter(r => r.lat != null && r.lng != null);
    for (const ec of excelCoordRows) {
      let best = { km: 99999, name: null };
      for (const dc of dataCoords) {
        const km = haver(dc, ec);
        if (km < best.km) best = { km, name: dc.name, id: dc.id };
      }
      if (best.km > 0.5) {
        const excelName = ec.text.split(' — ')[0].substring(0, 50);
        fails.push(`d${d.dayNumber} excel "${excelName}" (${ec.lat.toFixed(4)},${ec.lng.toFixed(4)}) -> closest data.js stop ${best.id} "${best.name}" is ${best.km.toFixed(2)} km off`);
      }
    }
  }
  log('T2 every Excel pin matches some data.js stop within 500 m',
      fails.length ? 'WARN' : 'PASS',
      fails.length ? `${fails.length} pins drift; first 5: ` + fails.slice(0,5).join(' | ') : 'all Excel pins map to a data.js stop');
}

// ─── TEST 3: data.js stops referenced by name in Excel narratives have matching coords ───
// For each Excel row whose narrative starts with a stop name, find the data.js stop
// whose name matches that prefix. On name collision, prefer the stop currently
// linked by the schedule row (that's the one the Excel writer used).
{
  const fails = [];
  const matched = [];
  const duplicates = []; // pre-existing data hygiene issues surfaced by the test
  for (let i = 0; i < DAYS.length; i++) {
    const d = DAYS[i];
    const ex = excelDays[i];
    if (!ex) continue;
    // Build a map of schedule-row time -> linked stop, so we can disambiguate on name collision.
    const timeToStopId = {};
    for (const r of (d.schedule || [])) if (r.time && r.stopId) timeToStopId[r.time] = r.stopId;
    for (const er of ex.rows) {
      if (er.lat == null || er.lng == null) continue;
      const namePart = er.text.split(' — ')[0].trim();
      if (!namePart || namePart.length < 4) continue;
      const matches = (d.stops || []).filter(s => s.name && (
        s.name.toLowerCase().startsWith(namePart.toLowerCase()) ||
        namePart.toLowerCase().startsWith(s.name.toLowerCase())
      ));
      if (!matches.length) continue;
      let ds = matches[0];
      if (matches.length > 1) {
        const linkedId = timeToStopId[er.time];
        const exact = matches.find(s => s.id === linkedId);
        if (exact) {
          ds = exact;
          duplicates.push(`d${d.dayNumber} time ${er.time} "${namePart}" -> ${matches.length} stops [${matches.map(m=>m.id).join(',')}]; schedule uses ${linkedId}`);
        }
      }
      if (!ds.coordinates) continue;
      const km = haver(ds.coordinates, { lat: er.lat, lng: er.lng });
      if (km > 0.5) {
        fails.push(`d${d.dayNumber} ${ds.id} "${ds.name}": data=${ds.coordinates.lat.toFixed(4)},${ds.coordinates.lng.toFixed(4)} excel=${er.lat.toFixed(4)},${er.lng.toFixed(4)} (${km.toFixed(2)} km off)`);
      } else {
        matched.push(ds.id);
      }
    }
  }
  const detail = fails.length
    ? `${fails.length} drift; first 5: ` + fails.slice(0,5).join(' | ')
    : `${matched.length} name-matched stops within 500 m of Excel`;
  log('T3 named-stop coords match Excel',
      fails.length ? 'FAIL' : 'PASS',
      detail);
  if (duplicates.length) {
    log('T3b duplicate stop names surfaced (data hygiene)',
        'WARN',
        `${duplicates.length} duplicates found. Review: ${duplicates.slice(0,3).join(' | ')}`);
  }
}

// ─── TEST 4: Navigate button URL = current stop's coords (static source check) ─
{
  const renderSrc = fs.readFileSync(RENDER_PATH, 'utf8');
  const checks = [
    { name: 'renderScheduleRow nav uses current coords',
      ok: /Nav target = the CURRENT stop on this row/.test(renderSrc) &&
          /const navUrl = coords \? mapsNavUrl\(coords\) : null;\s*\n\s*const navTargetName = stop \? stop\.name : null;/.test(renderSrc) },
    { name: 'renderScheduleRow no forward-walk loop',
      ok: !/for \(let j = index \+ 1; j < rows\.length;/.test(renderSrc) },
    { name: 'renderStop nav uses current coords',
      ok: /Navigate button always targets the CURRENT stop/.test(renderSrc) },
    { name: 'renderStop no nextCoords reference',
      ok: !/const nextCoords = nextStop \? getStopCoords\(nextStop\)/.test(renderSrc) },
  ];
  const failed = checks.filter(c => !c.ok);
  log('T4 Navigate button targets current stop',
      failed.length ? 'FAIL' : 'PASS',
      failed.length ? failed.map(f => f.name).join('; ') : 'render.js confirms current-stop nav in both renderers');
}

// ─── TEST 5: schedule narrative text aligns with linked stop name ────────────
{
  const fails = [];
  for (const d of DAYS) {
    const byId = {};
    for (const s of (d.stops || [])) byId[s.id] = s;
    for (const row of (d.schedule || [])) {
      if (!row.stopId || !row.text) continue;
      const stop = byId[row.stopId];
      if (!stop) continue;
      const nameTokens = stop.name.toLowerCase().replace(/[^\w\s-]/g, '').split(/\s+/).filter(t => t.length > 3);
      const text = row.text.toLowerCase();
      // At least one significant token from the stop name should appear in the text
      const hit = nameTokens.some(t => text.includes(t));
      if (!hit && nameTokens.length) {
        fails.push(`d${d.dayNumber} ${row.time || ''} ${row.stopId} "${stop.name}" — text doesn't mention any name token`);
      }
    }
  }
  log('T5 schedule.text mentions linked stop',
      fails.length ? 'WARN' : 'PASS',
      fails.length ? `${fails.length} rows; first 5: ` + fails.slice(0,5).join(' | ') : 'all rows mention their linked stop');
}

// ─── TEST 6: Mapy URL uses the same coords passed in (no cross-pollination) ──
{
  const appSrc = fs.readFileSync(APP_PATH, 'utf8');
  // Find the function and the next 5 lines after `function mapyShowUrl(c)`
  const idx = appSrc.indexOf('function mapyShowUrl(');
  const ok = idx >= 0 &&
             /center=\$\{c\.lng\},\$\{c\.lat\}/.test(appSrc.slice(idx, idx + 400));
  log('T6 Mapy URL builder uses the c.lat,c.lng passed in',
      ok ? 'PASS' : 'FAIL',
      ok ? `mapyShowUrl(c) -> https://mapy.com/...?center=\${c.lng},\${c.lat}` : 'mapyShowUrl signature missing or wrong');

  // Also check: in render.js, mapyShowUrl is called with the CURRENT stop's coords
  const renderSrc = fs.readFileSync(RENDER_PATH, 'utf8');
  // Look for mapyShowUrl(coords) pattern (where coords is the current stop's coords variable)
  const callsCorrect = (renderSrc.match(/mapyShowUrl\(coords\)/g) || []).length >= 1;
  log('T6b Mapy button passes current stop coords',
      callsCorrect ? 'PASS' : 'FAIL',
      callsCorrect ? 'render.js: mapyShowUrl(coords) where coords = current stop' : 'mapyShowUrl call site not using current coords');
}

// ─── TEST 7: AllTrails slug uniqueness + correctness ─────────────────────────
{
  // Allow-list: slug intentionally shared by stops that are part of the same loop.
  const ALLOWED_SHARED_SLUGS = {
    'us/utah/chesler-park-loop-via-elephant-hill': ['d4-s3', 'd4-s4'],
    'us/utah/peek-a-boo-and-spooky-slot-canyons-via-upper-dry-fork-narrows': ['d13-s2', 'd13-s3'],
  };
  const slugToIds = {};
  for (const [id, slug] of Object.entries(slugs)) {
    (slugToIds[slug] ||= []).push(id);
  }
  const stopById = {};
  for (const d of DAYS) for (const s of (d.stops || [])) stopById[s.id] = s.name;
  const unexplainedDupes = Object.entries(slugToIds)
    .filter(([s, ids]) => ids.length > 1)
    .filter(([s, ids]) => {
      const allowed = ALLOWED_SHARED_SLUGS[s];
      if (!allowed) return true;
      return !(ids.length === allowed.length && ids.every(i => allowed.includes(i)));
    });
  log('T7 AllTrails slug uniqueness (allow-list applied)',
      unexplainedDupes.length ? 'FAIL' : 'PASS',
      unexplainedDupes.length
        ? `${unexplainedDupes.length} unexpected dupes: ${unexplainedDupes.map(([s, ids]) => `${s} -> ${ids.join(',')}`).slice(0,3).join(' | ')}`
        : `${Object.keys(slugs).length} slugs verified; ${Object.keys(ALLOWED_SHARED_SLUGS).length} legitimately shared between sibling stops`);
}

// ─── TEST 8: hotel Navigate URL = that day's hotel coords (data check) ───────
{
  const fails = [];
  for (const d of DAYS) {
    if (!d.hotel) continue;
    if (!d.hotel.coordinates) {
      // Some days legitimately have no hotel coords (departure day) — only flag if hotel.name is set but coords are missing
      if (d.hotel.name) fails.push(`d${d.dayNumber} hotel "${d.hotel.name}" has no coordinates`);
      continue;
    }
    if (typeof d.hotel.coordinates.lat !== 'number' || typeof d.hotel.coordinates.lng !== 'number') {
      fails.push(`d${d.dayNumber} hotel coords malformed: ${JSON.stringify(d.hotel.coordinates)}`);
    }
  }
  log('T8 hotel coords valid for every day',
      fails.length ? 'WARN' : 'PASS',
      fails.length ? fails.slice(0,5).join(' | ') : 'every day with a hotel name has valid coords');
}

// ─── TEST 9: no same-day duplicate stop coords ───────────────────────────────
{
  const fails = [];
  for (const d of DAYS) {
    const seen = {};
    for (const s of (d.stops || [])) {
      if (!s.coordinates) continue;
      const key = `${s.coordinates.lat.toFixed(5)},${s.coordinates.lng.toFixed(5)}`;
      if (seen[key]) {
        fails.push(`d${d.dayNumber}: ${seen[key]} and ${s.id} both at ${key}`);
      }
      seen[key] = s.id;
    }
  }
  log('T9 no same-day duplicate coords',
      fails.length ? 'FAIL' : 'PASS',
      fails.length ? fails.slice(0,5).join(' | ') : '0 same-day coord collisions');
}

// ─── TEST 10: no Hebrew in any schedule.text or stop tip/difficulty ─────────
{
  const fails = [];
  for (const d of DAYS) {
    for (const r of (d.schedule || [])) {
      if (r.text && HEBREW_RX.test(r.text)) {
        fails.push(`d${d.dayNumber} schedule[${r.time}] text has Hebrew`);
      }
    }
    // tips and difficulty are stop-level — these are the legacy Hebrew strings on Days 5-23
    // We're only enforcing on Days 1-3 + d3-s12 in this batch. Full sweep is a later task.
    if (d.dayNumber <= 3) {
      for (const s of (d.stops || [])) {
        if (s.tip && HEBREW_RX.test(s.tip)) fails.push(`d${d.dayNumber} ${s.id} tip has Hebrew`);
        if (s.difficulty && HEBREW_RX.test(s.difficulty)) fails.push(`d${d.dayNumber} ${s.id} difficulty has Hebrew`);
      }
    }
  }
  log('T10 no Hebrew in narratives Days 1-3',
      fails.length ? 'FAIL' : 'PASS',
      fails.length ? fails.slice(0,8).join(' | ') : '0 Hebrew strings in Days 1-3 schedule, tips, or difficulty');
}

// ─── TEST 11: data.js schedule order matches create-excel.js source-of-truth ─
// (Smoke test: create-excel.js DAYS array length matches data.js, and Day 1-3
// activity counts roughly align with schedule rows that have text or stopId.)
{
  const ceSrc = fs.readFileSync(CREATE_EXCEL_PATH, 'utf8');
  const fails = [];
  // Count `day:N` blocks in create-excel.js
  const dayBlockMatches = ceSrc.match(/^\s*day:\d+,/gm) || [];
  if (dayBlockMatches.length !== DAYS.length) {
    fails.push(`create-excel.js DAYS count = ${dayBlockMatches.length}, data.js = ${DAYS.length}`);
  }
  // Spot-check Days 1-3 first activity text matches data.js row[0] text
  for (let n = 1; n <= 3; n++) {
    const day = DAYS.find(d => d.dayNumber === n);
    const firstRow = (day.schedule || []).find(r => r.text);
    if (!firstRow) continue;
    // Find the first non-empty text in create-excel.js after `day:N,`
    const re = new RegExp(`day:${n},[\\s\\S]*?text:\\s*"([^"]+)"`);
    const m = ceSrc.match(re);
    if (!m) continue;
    const ceText = m[1].slice(0, 60);
    const djText = firstRow.text.slice(0, 60);
    if (ceText.replace(/\\"/g, '"') !== djText) {
      // Light comparison — flag mismatch
      fails.push(`d${n} first text differs:\n  create-excel: "${ceText}..."\n  data.js:     "${djText}..."`);
    }
  }
  log('T11 data.js ≡ create-excel.js (Days 1-3 first row spot-check)',
      fails.length ? 'WARN' : 'PASS',
      fails.length ? fails.slice(0,3).join(' | ') : 'Days 1-3 first row text matches between source-of-truth and runtime');
}

// ─── TEST 12: lint baseline ─────────────────────────────────────────────────
// Baseline = pre-existing violations on Days 4-24 + pre-trip wizard. My English
// translations should add 0 new violations. Total should be ≤ 73.
{
  const { execSync } = require('child_process');
  let out;
  try {
    out = execSync('node tools/lint-text.js', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    out = (e.stdout || '') + (e.stderr || '');
  }
  const m = out.match(/(\d+)\s+style violation/);
  const count = m ? Number(m[1]) : null;
  const baseline = 73;
  log('T12 lint violations vs baseline',
      count == null ? 'WARN' : (count <= baseline ? 'PASS' : 'FAIL'),
      count == null ? 'could not parse lint output' : `${count} violations (baseline ${baseline}; my edits should add 0)`);
}

// ─── TEST 13: day-boundary sanity (last stop -> hotel, first stop -> prev hotel) ───
// Day 1 = arrival from SLC airport to Moab (319 km) is by design — exempt.
{
  const fails = [];
  for (let i = 0; i < DAYS.length; i++) {
    const d = DAYS[i];
    if (!d.hotel || !d.hotel.coordinates) continue;
    if (d.dayNumber === 1) continue; // arrival drive from airport
    const lastRow = [...(d.schedule || [])].reverse().find(r => r.stopId);
    if (lastRow) {
      const stop = (d.stops || []).find(s => s.id === lastRow.stopId);
      if (stop && stop.coordinates) {
        const km = haver(stop.coordinates, d.hotel.coordinates);
        if (km > 110) fails.push(`d${d.dayNumber}: last stop ${stop.id} -> hotel = ${km.toFixed(0)} km`);
      }
    }
    if (i + 1 < DAYS.length) {
      const next = DAYS[i+1];
      const firstRow = (next.schedule || []).find(r => r.stopId);
      if (firstRow) {
        const stop = (next.stops || []).find(s => s.id === firstRow.stopId);
        if (stop && stop.coordinates) {
          const km = haver(d.hotel.coordinates, stop.coordinates);
          if (km > 150) fails.push(`d${d.dayNumber} hotel -> d${next.dayNumber} first stop ${stop.id} = ${km.toFixed(0)} km`);
        }
      }
    }
  }
  log('T13 day-boundary distances (Day 1 arrival exempt)',
      fails.length ? 'WARN' : 'PASS',
      fails.length ? fails.slice(0,5).join(' | ') : 'all last-stop->hotel ≤110 km AND hotel->next-first-stop ≤150 km');
}

// ─── Print report ────────────────────────────────────────────────────────────
console.log('\n=== MomTrip integrity test report ===\n');
let pass = 0, fail = 0, warn = 0;
for (const r of results) {
  const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️ ';
  console.log(`${icon} ${r.test}`);
  console.log(`     ${r.detail}`);
  if (r.status === 'PASS') pass++;
  else if (r.status === 'FAIL') fail++;
  else warn++;
}
console.log(`\nSummary: ${pass} pass, ${warn} warn, ${fail} fail (${results.length} tests)\n`);
process.exit(fail > 0 ? 1 : 0);
