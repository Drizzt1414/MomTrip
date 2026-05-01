// One-shot data.js cleanup: typos, trailing " Utah"/" Arizona", apostrophe-S case, & spacing.
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'js', 'data.js');
let s = fs.readFileSync(DATA, 'utf8');
const before = s.length;
let n = 0;
function R(find, rep, label) {
  const re = find instanceof RegExp ? find : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const m = s.match(re);
  if (m) { n += m.length; s = s.replace(re, rep); console.log(`  ${m.length}× ${label}`); }
}
console.log('Typos:');
R('Fiery Furance', 'Fiery Furnace', 'Furance → Furnace');
R('Canyolands', 'Canyonlands', 'Canyolands → Canyonlands');
R(/"Pinetree Arch"/g, '"Pine Tree Arch"', 'Pinetree Arch → Pine Tree Arch');
R(/"pinetree arch"/g, '"pine tree arch"', 'pinetree arch → pine tree arch (nameOriginal)');
R('Factory Bute', 'Factory Butte', 'Factory Bute → Factory Butte');
R('Uppercalf Creek', 'Upper Calf Creek', 'Uppercalf → Upper Calf');
R('uppercalf creek', 'upper calf creek', 'uppercalf (lower) → upper calf');
R('Lowerdry Fork', 'Lower Dry Fork', 'Lowerdry → Lower Dry');
R('lowerdry fork', 'lower dry fork', 'lowerdry (lower) → lower dry');
R('Frying Pantrail', 'Frying Pan Trail', 'Frying Pantrail → Frying Pan Trail');
R('frying pantrail', 'frying pan trail', 'frying pantrail (lower) → frying pan trail');
R('Navajo Knobs 6', 'Navajo Knobs &', 'Navajo Knobs 6 → &');
R('Lake Powel Resort', 'Lake Powell Resort', 'Lake Powel → Lake Powell');
R('Lake Powel ', 'Lake Powell ', 'Lake Powel (other) → Powell');
R('liggae', 'luggage', 'liggae → luggage');
R('pedastel', 'pedestal', 'pedastel → pedestal');
R('tabk road', 'tank road', 'tabk → tank');
R('ה-onderosa', 'ה-Ponderosa', 'onderosa → Ponderosa');
R('courthose', 'courthouse', 'courthose → courthouse');
R('Sun Outdoor Arches Gateway', 'Sun Outdoors Arches Gateway', 'Sun Outdoor → Sun Outdoors');
R('Little Horse Canyon', 'Little Wild Horse Canyon', 'Little Horse → Little Wild Horse');
R('קניון ליטל הורס', 'קניון ליטל ווילד הורס', 'קניון ליטל הורס Hebrew');
R('"Devil\'S Garden( Hoodoos) Utah"', '"Devils Garden Hoodoos"', "Devil'S Garden( Hoodoos) Utah →");
R('"devil\'s garden( hoodoos) utah"', '"devils garden hoodoos"', 'lowercase devil garden hoodoos');
R('Organized Trip - Antelope Canyon', 'Antelope Canyon (Guided Tour)', 'Organized Trip → Guided Tour');
R('organized trip - antelope canyon', 'antelope canyon (guided tour)', 'lowercase');
R('Spencer Bench Rim', 'Spencer Trail Rim', 'Spencer Bench Rim → Trail Rim');
R('spencer bench rim', 'spencer trail rim', 'lowercase');

console.log('\n& spacing:');
R(/([A-Za-z])&([A-Za-z])/g, '$1 & $2', 'X&Y → X & Y');

console.log('\nApostrophe-S case fixes (title-case "X\'S" → "X\'s"):');
R(/([A-Za-z])'S\b/g, "$1's", "X'S → X's");

console.log('\n"Devil\'s Garden" → "Devils Garden" (NPS/BLM official no apostrophe):');
R(/Devil's Garden/g, 'Devils Garden', "Devil's Garden → Devils Garden");

console.log('\nStrip trailing " Utah"/" Arizona" from stop names (inside quoted strings):');
// Match "name": "Something Utah" → "name": "Something"
R(/"name":\s*"([^"]+?) Utah"/g, '"name": "$1"', 'name: "... Utah"');
R(/"name":\s*"([^"]+?) Arizona"/g, '"name": "$1"', 'name: "... Arizona"');
R(/"nameOriginal":\s*"([^"]+?) utah"/g, '"nameOriginal": "$1"', 'nameOriginal lowercase utah');
R(/"nameOriginal":\s*"([^"]+?) arizona"/g, '"nameOriginal": "$1"', 'nameOriginal lowercase arizona');

console.log('\nTitle-case "In/The/Of" inside multi-word place names (limited set):');
R(/Hole In The Rock/g, 'Hole in the Rock', 'Hole In The Rock');
R(/hole in the rock/g, 'hole in the rock', 'lowercase (noop check)');
R(/Head Of The Rock/g, 'Head of the Rock', 'Head Of The Rock');
R(/Out Of Africa/g, 'Out of Africa', 'Out Of Africa placeholder');
R(/Island In The Sky/g, 'Island in the Sky', 'Island In The Sky');

console.log('\nPeekaboo normalization (one word):');
R(/Peek A Boo/g, 'Peekaboo', 'Peek A Boo → Peekaboo');
R(/peek a boo/g, 'peekaboo', 'lowercase');

console.log('\nToadstools And → Toadstools and:');
R(/Toadstools And /g, 'Toadstools and ', 'Toadstools And');

console.log('\nTemple Mountains Road → Temple Mountain Road:');
R(/Temple Mountains Road/g, 'Temple Mountain Road', 'Temple Mountains → Temple Mountain');
R(/temple mountains road/g, 'temple mountain road', 'lowercase');

fs.writeFileSync(DATA, s);
console.log(`\n${n} replacements applied. ${before - s.length} bytes removed.`);
