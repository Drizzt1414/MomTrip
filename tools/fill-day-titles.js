// Fill missing day titles (both English + Hebrew) based on the create-excel DAYS array.
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'js', 'data.js');

const TITLES = {
  1:  { en: 'Arrival — Salt Lake City',               he: 'הגעה — סולט לייק סיטי' },
  4:  { en: 'Canyonlands — Needles District',         he: 'קניונלנדס — מחוז המחטים' },
  9:  { en: 'Capitol Reef — Trails',                  he: 'קפיטול ריף — מסלולים' },
  10: { en: 'Capitol Reef — South District',          he: 'קפיטול ריף — המחוז הדרומי' },
  11: { en: 'Muley Twist & Waterpocket Fold',         he: 'מיולי טוויסט וווטרפוקט פולד' },
  12: { en: 'Escalante & Highway 12',                 he: 'אסקלנטה וכביש 12' },
  14: { en: 'Grand Staircase → Vermilion Cliffs → Page', he: 'גרנד סטיירקייס → מצוקי ורמיליון → פייג׳' },
  15: { en: 'Lees Ferry & Marble Canyon',             he: 'ליס פרי ומארבל קניון' },
  16: { en: 'Antelope Canyon',                        he: 'קניון אנטילופ' },
  17: { en: 'Bryce Canyon — Scenic Drive',            he: 'ברייס קניון — נסיעה נופית' },
  18: { en: 'Bryce Canyon — Hiking',                  he: 'ברייס קניון — מסלולי הליכה' },
  20: { en: 'Zion Canyon — Day 2',                    he: 'קניון ציון — יום 2' },
  22: { en: 'Las Vegas',                              he: 'לאס וגאס' },
  23: { en: 'Red Rock Canyon',                        he: 'רד רוק קניון' },
  24: { en: 'Departure — Las Vegas',                  he: 'יציאה — לאס וגאס' },
};

let s = fs.readFileSync(DATA, 'utf8');
let count = 0;

for (const [num, t] of Object.entries(TITLES)) {
  // Match the day block header: "dayNumber": 14,  followed by empty title/titleHe.
  const rx = new RegExp(
    '("dayNumber":\\s*' + num + ',\\s*"date":\\s*"[^"]+",\\s*"title":\\s*")("\\s*,\\s*"titleHe":\\s*")("\\s*,)',
    'g'
  );
  const before = s;
  s = s.replace(rx, (_, pre, mid, post) => {
    count++;
    return pre + t.en.replace(/"/g, '\\"') + mid + t.he + post;
  });
  if (s === before) console.log(`  (no match) Day ${num}`);
  else console.log(`  filled Day ${num}`);
}

fs.writeFileSync(DATA, s);
console.log(`\n${count} day titles filled.`);
