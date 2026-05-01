#!/usr/bin/env node
// state-snapshot.js — print the canonical current state for a given day
// Usage:
//   node tools/state-snapshot.js                 -> trip-level summary
//   node tools/state-snapshot.js 5                -> day 5 schedule + stops
//   node tools/state-snapshot.js 5 --check-review -> also diff against review/day-5.html ROWS
//
// Why this exists: Claude was quoting timing tables from short-term memory and
// drifting from js/data.js. This script forces a re-read and prints a stamp
// (mtime, size, sha256) so the version is unambiguous.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'js', 'data.js');

function loadTripData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  const json = raw.slice(start, end + 1);
  return { data: JSON.parse(json), raw };
}

function fileStamp(p) {
  const stat = fs.statSync(p);
  const buf = fs.readFileSync(p);
  const sha = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12);
  return {
    path: path.relative(ROOT, p).replace(/\\/g, '/'),
    mtime: stat.mtime.toISOString(),
    bytes: stat.size,
    sha: sha,
  };
}

function fmtRow(s, i) {
  const time = (s.time ?? '—').toString().padEnd(11);
  const kind = (s.kind ?? '—').toString().padEnd(8);
  const dur = (s.duration ?? '—').toString().padEnd(14);
  const text = (s.text ?? '').replace(/\s+/g, ' ').slice(0, 90);
  return `  ${String(i + 1).padStart(2)}. ${time} ${kind} ${dur} ${text}`;
}

function printDay(data, dayNum) {
  const day = data.days[dayNum - 1];
  if (!day) {
    console.log(`No day ${dayNum} found (trip has ${data.days.length} days)`);
    return;
  }
  console.log(`\nDay ${day.dayNumber} — ${day.date} — ${day.title}`);
  console.log(`Hotel: ${day.hotel?.name ?? '—'}`);
  console.log(`Wake: ${day.wakeup ?? '—'}   Depart: ${day.depart ?? '—'}`);

  console.log(`\nSchedule (${day.schedule.length} rows):`);
  day.schedule.forEach((s, i) => console.log(fmtRow(s, i)));

  console.log(`\nStops (${day.stops.length}):`);
  day.stops.forEach((s, i) => {
    const audit = s.audit?.status ?? '—';
    console.log(`  ${i + 1}. ${s.emoji ?? ''} ${s.name}  [${s.type ?? '—'}, audit:${audit}]`);
  });

  // Distinguish orphan map-markers (intentional fallback for unmatched stops)
  // from truly blank rows that need investigation.
  const orphans = day.schedule.filter(s => s.orphan);
  const trueBlanks = day.schedule.filter(s => !s.text && !s.orphan);
  if (orphans.length) {
    console.log(`\n  ${orphans.length} orphan map-marker row(s) (intentional — stops not matched to schedule narrative):`);
    orphans.forEach(s => {
      const stop = day.stops.find(x => x.id === s.stopId);
      console.log(`     stopId=${s.stopId} → ${stop ? stop.name : '(missing!)'}`);
    });
  }
  if (trueBlanks.length) {
    console.log(`\n⚠️  ${trueBlanks.length} truly blank schedule row(s):`);
    trueBlanks.forEach((s) => console.log(`     #${day.schedule.indexOf(s) + 1}: time=${s.time ?? 'null'} kind=${s.kind} text=${(s.text ?? '').slice(0, 40) || 'EMPTY'}`));
  }
}

function checkReview(data, dayNum) {
  const reviewPath = path.join(ROOT, 'review', `day-${dayNum}.html`);
  if (!fs.existsSync(reviewPath)) {
    console.log(`\n(no review/day-${dayNum}.html — skip drift check)`);
    return;
  }
  const html = fs.readFileSync(reviewPath, 'utf8');
  const rowsMatch = html.match(/const ROWS\s*=\s*\[([\s\S]*?)\];/);
  if (!rowsMatch) {
    console.log(`\n(review/day-${dayNum}.html has no ROWS array — skip)`);
    return;
  }
  // Extract review row { name, text } pairs
  const rowBlocks = rowsMatch[1].split(/\},\s*\{/);
  const reviewRows = rowBlocks.map(b => {
    const nm = b.match(/name:\s*'([^']+)'/);
    const tx = b.match(/text:\s*'((?:[^'\\]|\\.)*)'/);
    return {
      name: nm ? nm[1] : '',
      text: tx ? tx[1].replace(/\\'/g, "'") : '',
    };
  }).filter(r => r.name);

  // Build a token bag from each data.js schedule row's text
  const dayData = data.days[dayNum - 1];
  const tokenize = s => new Set((s || '').toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3));
  const dataBags = dayData.schedule.map(s => tokenize(s.text));

  console.log(`\nDrift check vs review/day-${dayNum}.html:`);
  console.log(`  review/day-${dayNum}.html ROWS:  ${reviewRows.length} entries`);
  console.log(`  js/data.js day ${dayNum} schedule: ${dayData.schedule.length} rows (${dayData.schedule.filter(s => s.time && s.text).length} non-blank, ${dayData.schedule.filter(s => s.orphan).length} orphan map-markers)`);

  // For each review row, check whether any data row shares >= 3 distinguishing tokens
  // (excluding very common words like "drive", "road", "highway")
  const COMMON = new Set(['drive', 'road', 'highway', 'mile', 'miles', 'minute', 'minutes', 'this', 'that', 'with', 'from', 'into', 'over', 'walk', 'stop', 'back', 'through', 'south', 'north', 'east', 'west', 'hour', 'hours']);
  const distinctTokens = bag => new Set([...bag].filter(w => !COMMON.has(w)));

  const missing = [];
  for (const r of reviewRows) {
    const rBag = distinctTokens(tokenize(r.name + ' ' + r.text));
    let bestOverlap = 0;
    for (const dBag of dataBags) {
      const dDistinct = distinctTokens(dBag);
      let overlap = 0;
      for (const w of rBag) if (dDistinct.has(w)) overlap++;
      if (overlap > bestOverlap) bestOverlap = overlap;
    }
    if (bestOverlap < 3) missing.push({ name: r.name, overlap: bestOverlap });
  }

  if (missing.length) {
    console.log(`\n  ⚠️  Review rows with weak match in js/data.js (<3 distinctive tokens):`);
    missing.forEach(m => console.log(`       - "${m.name}"  (best overlap: ${m.overlap})`));
  } else {
    console.log(`  ✓ all ${reviewRows.length} review rows match data.js (>=3 distinctive token overlap)`);
  }
}

function tripSummary(data) {
  console.log(`\nTrip: ${data.trip.name}`);
  console.log(`Dates: ${data.trip.startDate} → ${data.trip.endDate} (${data.trip.totalDays} days)`);
  console.log(`Days in data: ${data.days.length}`);
  console.log(`\nPer-day row counts:`);
  data.days.forEach(d => {
    const orphans = d.schedule.filter(s => s.orphan).length;
    const trueBlanks = d.schedule.filter(s => !s.text && !s.orphan).length;
    const real = d.schedule.length - orphans - trueBlanks;
    let flag = '';
    if (orphans) flag += `  (${orphans} orphan-marker)`;
    if (trueBlanks) flag += `  ⚠️ ${trueBlanks} blank`;
    console.log(`  Day ${String(d.dayNumber).padStart(2)} ${d.date}  ${String(real).padStart(2)} sched  ${String(d.stops.length).padStart(2)} stops  — ${d.title}${flag}`);
  });
}

// --- main ---
const args = process.argv.slice(2);
const dayArg = args.find(a => /^\d+$/.test(a));
const checkReviewFlag = args.includes('--check-review');

const stamp = fileStamp(DATA_PATH);
console.log(`SOURCE: ${stamp.path}`);
console.log(`  mtime: ${stamp.mtime}`);
console.log(`  bytes: ${stamp.bytes}`);
console.log(`  sha:   ${stamp.sha}`);
console.log(`  read:  ${new Date().toISOString()}`);

const { data } = loadTripData();

if (!dayArg) {
  tripSummary(data);
} else {
  printDay(data, parseInt(dayArg, 10));
  if (checkReviewFlag) checkReview(data, parseInt(dayArg, 10));
}
