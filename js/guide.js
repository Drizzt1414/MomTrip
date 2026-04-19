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
  for (const [k, v] of Object.entries(DESCRIPTIONS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return '';
}

// Override renderGuidePanel
renderGuidePanel = function(s) {
  const text = getDesc(s);
  if (!text) {
    return `<div class="guide-panel">
      <div class="guide-text" style="text-align:center;color:var(--text-muted);">🎙️ תיאור המקום יתווסף בקרוב</div>
    </div>`;
  }
  const safe = text.replace(/'/g, "\\'");
  return `<div class="guide-panel">
    <div class="guide-text">${text}</div>
    <button class="speak-btn" onclick="event.stopPropagation();speakHebrew('${safe}','${s.name}')">
      🔊 הקשיבי
    </button>
  </div>`;
};

// Override daily briefing
playDailyBriefing = function(dayNum) {
  const day = TRIP_DATA.days.find(d => d.dayNumber === dayNum);
  if (!day) return;
  const stops = getDayStops(day);
  let b = `בוקר טוב! היום יום ${day.dayNumber} בטיול, ${formatDateHe(day.date)}. `;
  if (day.titleHe) b += `אנחנו ב${day.titleHe}. `;
  else if (day.title) b += `אנחנו ב${day.title}. `;
  b += `יש ${stops.length} תחנות. `;
  const first3 = stops.slice(0, 3);
  if (first3[0]) b += `נתחיל ב${first3[0].name}`;
  if (first3[1]) b += `, נמשיך ל${first3[1].name}`;
  if (first3[2]) b += ` ואז ל${first3[2].name}`;
  if (first3.length) b += '. ';
  if (day.hotel) b += `הלילה ב${day.hotel.name}. `;
  const errs = stops.filter(s => s.audit.status === 'error');
  if (errs.length) b += `שימי לב, ${errs.length} תחנות דורשות בדיקה. `;
  b += `יום נפלא!`;
  speakHebrew(b, `סיכום יום ${day.dayNumber}`);
};
