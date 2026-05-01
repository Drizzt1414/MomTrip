// === Tour Guide — Hebrew descriptions + TTS ===

const DESCRIPTIONS = {
  'arches national park visitor center': 'מרכז המבקרים של פארק ארצ\'ס. כאן תוכלי לקבל מפה, לשמוע על מסלולים ולברר על מזג האוויר. המקום ממוזג ויש שירותים.',
  'la sal mountains viewpoint': 'תצפית על הרי לה-סאל המושלגים. עצרי בצד הדרך וצלמי. לא צריך ללכת!',
  'balanced rock': 'סלע ענקי שנראה כאילו הוא עומד ליפול! יש מסלול קצר וקל שמקיף את הסלע.',
  'double arch': 'שתי קשתות ענקיות שחולקות בסיס אחד. מרשים מאוד. המסלול קצר וקל.',
  'delicate arch trail': 'המסלול לקשת העדינה - הסמל של יוטה! תלול קצת, כ-5 ק"מ הלוך-חזור. קחי הרבה מים!',
  'landscape arch': 'הקשת הארוכה ביותר בצפון אמריקה! 93 מטר. המסלול שטוח וקל.',
  'mesa arch': 'קשת קטנה ומושלמת שממסגרת את הקניון. מסלול קצר מאוד.',
  'dead horse point state park': 'תצפית על נהר קולורדו שמתפתל 600 מטר למטה. נוף שעוצר נשימה!',
  'grand view point': 'התצפית הגדולה - רואים עד האופק. יש מעקה, בטוח.',
  'hickman bridge trail': 'גשר טבעי מרשים! כ-3 ק"מ הלוך-חזור, עלייה מתונה.',
  'fruita historic district': 'אזור היסטורי עם מטעי פירות מלפני 100 שנה. מקום ירוק ונעים.',
  'cassidy arch': 'קשת טבעית על שם השודד בוץ\' קסידי. המסלול תלול אבל קצר.',
  'sunset point bryce canyon': 'תצפית מרהיבה על עמודי הסלע האדומים. אחד הנופים הכי מיוחדים בעולם!',
  'rainbow point': 'הנקודה הגבוהה ביותר בברייס קניון. רואים עד 160 ק"מ!',
  'zion n/p visitor center': 'מרכז המבקרים של ציון. כאן עולים על האוטובוס לתוך הקניון.',
  'fire wave trail': 'תצורות סלע בצבעי אדום, כתום וורוד שנראים כמו גלים! מסלול קצר.',
  'white domes trail': 'מסלול קצר עם סלעים לבנים, קניון צר וצבעים מדהימים.',
  'horseshoe bend': 'פרסת הסוס - נהר קולורדו מתפתל 300 מטר למטה. מצולם מאוד!',
  'red rock canyon visitor center': 'סלעים אדומים מרהיבים ליד לאס וגאס. נהיגה נוחה.',
  'calico hills': 'גבעות צבעוניות באדום, כתום וקרם. נראה כמו ציור!',
  'goblin': 'תצורות סלע מוזרות שנראות כמו יצורים קטנים! מקום מהנה.',
  'lower calf creek falls': 'מפל מים בגובה 40 מטר! כ-10 ק"מ הלוך-חזור. קחי מים ואוכל.',
  'navajo bridge': 'גשר מעל הקניון - תצפית על נהר קולורדו. לפעמים רואים קונדורים!',
  'glen canyon dam overlook': 'סכר ענקי שיצר את אגם פאוול. נוף מרהיב.',
  'kodachrome basin': 'עמודי סלע צבעוניים. קיבל את שמו מחברת קודאק!',
  'navajo loop bryce canyon': 'מסלול שיורד בין עמודי הסלע האדומים. מפורסם מאוד!',
  'kanarra falls': 'הליכה בתוך נחל עם מפלים קטנים. צריך ללכת במים! כיף גדול.',
  'valley of fire state park': 'סלעים אדומים מרהיבים במדבר נבאדה. מדהים.',
};

function getDesc(stop) {
  const key = stop.name.toLowerCase().replace(/ utah| arizona/gi, '').trim();
  // Only match the stop name INCLUDING the description key, not the reverse.
  // Reverse-match was over-greedy (e.g. "Arch" matched every "arches ..." description).
  // Require at least 6 chars of key for a safe short-name match.
  for (const [k, v] of Object.entries(DESCRIPTIONS)) {
    if (key === k) return v;
    if (key.includes(k) && k.length >= 6) return v;
  }
  return '';
}

// Override renderGuidePanel — show xlsx narrative (English) + a Listen button
// that reads it aloud in the selected English voice. Hebrew DESCRIPTIONS above
// are kept as a secondary display for mom's reading eye, but audio is English.
renderGuidePanel = function(s) {
  // Prefer the xlsx narrative attached to whichever schedule row matched this stop.
  let englishText = '';
  for (const d of TRIP_DATA.days) {
    const row = (d.schedule || []).find(r => r.stopId === s.id && r.text);
    if (row) { englishText = row.text; break; }
  }
  if (!englishText) englishText = s.name + (s.tip ? ` — ${s.tip}` : '');

  const hebrew = getDesc(s);
  const safeEn = englishText.replace(/\\/g,'\\\\').replace(/'/g, "\\'").replace(/\n/g,' ');

  return `<div class="guide-panel">
    ${hebrew ? `<div class="guide-text">${hebrew}</div>` : ''}
    <div class="guide-text-en ltr">${englishText}</div>
    <button class="speak-btn" onclick="event.stopPropagation();speakText('${safeEn}','${s.name}')">
      🔊 Listen (English)
    </button>
  </div>`;
};

// Daily briefing — English, assembled from the day's schedule rows.
function playDailyBriefing(dayNum) {
  const text = buildBriefingText(dayNum);
  if (text) speakText(text, `Day ${dayNum} briefing`);
}

function buildBriefingText(dayNum) {
  const day = TRIP_DATA.days.find(d => d.dayNumber === dayNum);
  if (!day) return '';
  const schedule = day.schedule || [];
  const date = new Date(day.date + 'T12:00:00');
  const wd = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
  const mo = ['January','February','March','April','May','June','July','August','September','October','November','December'][date.getMonth()];

  // Only xlsx-narrated stops drive the briefing prose. Orphan rows (individual
  // arches bundled under a parent narrative, or hotel-as-stop data entries)
  // would muddy the copy — "Today is all about Tuscany Suites & Casino".
  const stops = schedule.filter(r => ['stop','walk','hike','tour'].includes(r.kind) && !r.orphan);
  const drives = schedule.filter(r => r.kind === 'driving');
  const totalDriveMin = drives.reduce((a,r) => a + (r.durationMin || 0), 0);

  const byId = {}; for (const s of (day.stops || [])) byId[s.id] = s;
  function rowName(row) {
    if (row.stopId && byId[row.stopId]) return byId[row.stopId].name.replace(/\s*\(.*?\)\s*/g, '').trim();
    if (row.text) {
      const m = row.text.match(/^([A-Z][^—:.]{1,60})(?=\s+—|[:.]|$)/);
      if (m) return m[1].trim();
    }
    return null;
  }
  function fmtDur(min) {
    if (!min) return '';
    if (min < 60) return `${min} minutes`;
    const h = Math.floor(min/60), m = min%60;
    if (!m) return `${h} hour${h>1?'s':''}`;
    return `${h} hour${h>1?'s':''} and ${m} minutes`;
  }

  const lines = [];
  lines.push(`Good morning, Mom.`);
  lines.push(`Today is ${wd}, ${mo} ${date.getDate()}. This is day ${day.dayNumber} of your canyon trip.`);
  if (day.title) {
    const t = day.title.replace(/\s*—\s*/g, ', ').replace(/\s*→\s*/g, ' to ');
    // "Arrival, Salt Lake City" → "arriving in Salt Lake City"
    // "Departure, Las Vegas" → "departing from Las Vegas"
    if (/^arrival\s*,/i.test(t)) lines.push(`Today is travel day — you're arriving${t.replace(/^arrival\s*,\s*/i, ' in ')}.`);
    else if (/^departure\s*,/i.test(t)) lines.push(`Today is the last day — you're departing${t.replace(/^departure\s*,\s*/i, ' from ')}.`);
    else lines.push(`You're at ${t}.`);
  }

  if (day.wakeup && day.wakeup !== '—' && day.wakeup !== 'flexible') {
    const depart = (day.depart || 'your planned time').replace(/^by\s+/i, '');
    lines.push(`Wake up at ${day.wakeup}, and leave the hotel by ${depart}.`);
  }

  // Narrative arc: first three real stop names, not generic "the first stop".
  const placeNames = stops.map(rowName).filter(Boolean);
  if (placeNames.length === 1) {
    lines.push(`Today is all about ${placeNames[0]}.`);
  } else if (placeNames.length === 2) {
    lines.push(`You'll visit ${placeNames[0]} and ${placeNames[1]}.`);
  } else if (placeNames.length >= 3) {
    const first = placeNames.slice(0, Math.min(3, placeNames.length - 1));
    const last  = placeNames[placeNames.length - 1];
    lines.push(`You'll start with ${first.join(', ')}, and finish at ${last}.`);
  }

  // Biggest hike — mom's "big one today" — pick the longest-duration hike.
  const bigHike = schedule
    .filter(r => r.kind === 'hike' && (r.durationMin || 0) >= 90)
    .sort((a,b) => (b.durationMin || 0) - (a.durationMin || 0))[0];
  if (bigHike) {
    const nm = rowName(bigHike);
    if (nm) lines.push(`The big one today is ${nm}, about ${fmtDur(bigHike.durationMin)}.`);
  }

  if (totalDriveMin >= 30) lines.push(`Total driving today, about ${fmtDur(totalDriveMin)}.`);

  // Surface HIGH recommendations (Cathedral Valley, Angels Landing, cancels etc.)
  const recs = (typeof recsForDay === 'function') ? recsForDay(day) : [];
  const high = recs.filter(r => r.priority === 'HIGH');
  if (high.length) {
    lines.push(`One more thing, Mom — I have ${high.length === 1 ? 'a recommendation' : high.length + ' recommendations'} for today. Check the yellow card at the top.`);
  }

  if (day.hotel) {
    const hname = day.hotel.name.replace(/\s+—.*$|\s+\(.*\)$/, '').trim();
    lines.push(`Tonight you sleep at ${hname}.`);
  }

  lines.push(`Everything is ready. You planned this day perfectly. Have a beautiful time.`);

  return lines.join(' ');
}
