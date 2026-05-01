// Hebrew UI strings and date formatting
const UI = {
  appTitle: 'טיול הקניונים',
  appSubtitle: 'US Canyon Trip 2026',
  day: 'יום',
  stops: 'תחנות',
  hotel: 'מלון',
  hotelTonight: 'הלילה במלון',
  call: 'חייגי',
  navigate: 'נווטי',
  booking: 'הזמנה',
  todayPlan: 'התחנות להיום',
  whatToday: 'מה בתוכנית היום?',
  listenSummary: 'הקשיבי לסיכום',
  tellMeMore: 'ספרי לי על המקום',
  askGuide: 'שאלי את המדריכה',
  nextDay: 'היום הבא',
  prevDay: 'היום הקודם',
  verified: 'מאומת',
  warning: 'אזהרה',
  error: 'שגיאה',
  auditDashboard: 'בדיקת מסלול',
  criticalIssues: 'בעיות קריטיות',
  warnings: 'אזהרות',
  allVerified: 'הכל מאומת',
  fix: 'תקני',
  removeStop: 'הסירי תחנה',
  suggestedCoords: 'קואורדינטות מוצעות',
  distance: 'מרחק',
  minutes: 'דק\'',
  miles: 'מייל',
  offline: 'מצב לא מקוון',
  offlineMsg: 'הכיוונים והמפות עובדים גם בלי אינטרנט',
  downloadMaps: 'הורידי מפות אופליין',
  downloadMapsGuide: 'פתחי Google Maps → חפשי את האזור → לחצי "הורדה"',
  addHomeScreen: 'הוסיפי למסך הבית',
  noStops: 'אין תחנות ליום הזה',
  tripComplete: 'הטיול הושלם!',
  completed: 'הושלם',
  progress: 'התקדמות',
  checkCoords: 'בדקי קואורדינטות',
  impossibleDist: 'מרחק לא הגיוני — קואורדינטות שגויות?',
  suspiciousDist: 'מרחק גדול — בדקי את המסלול',
  placeNotExist: 'המקום לא קיים',
  openInMaps: 'פתחי במפות',
  close: 'סגרי',
  settings: 'הגדרות',
  auditMode: 'מצב בדיקה',
  hideCompleted: 'הסתירי שהושלמו',
  resetProgress: 'אפסי התקדמות',
  wakeUp: 'השכמה',
  leaveBy: 'יציאה',
  totalDrive: 'נסיעה',
  totalWalk: 'הליכה',
  recommendationsTitle: 'המלצות חשובות ליום הזה',
  recsOpen: 'פתחי המלצות',
  recsClose: 'סגרי המלצות',
  // Activity-kind labels (match xlsx legend)
  kindDriving: 'בנסיעה',
  kindStop:    'עצירה קצרה',
  kindWalk:    'הליכה קצרה',
  kindHike:    'טיול רגלי',
  kindTour:    'סיור מודרך',
  kindSleep:   'לילה במלון',
  kindAdd:     'להוסיף לתוכנית',
  kindNote:    'שימי לב',
  kindCancel:  'לבטל',
  priorityHigh:   'דחוף',
  priorityMedium: 'בינוני',
  priorityLow:    'לשיקול',
  priorityFix:    'לתיקון',
  voicePickerTitle: 'קול הקראה',
  voiceTest: 'שמעי טעימה',
  voiceSystemDefault: 'קול ברירת מחדל',
  voiceLoading: 'טוען קולות…',
};

// Rotating praise lines for mom — shown at the top of every day.
const MOM_PRAISE = [
  'היי אמא, את מדריכת טיולים מדהימה ✨',
  'היי אמא, תכננת טיול חלומות 💛',
  'את גאון של תכנון, אמא 🌟',
  'אמא, הטיול הזה הוא יצירת מופת 🎨',
  'אמא, את עושה את זה — ואת עושה את זה נפלא 🌵',
  'היי אמא, כל התחנות מחכות לך 🌞',
  'אמא, אני גאה בך על כל התכנון ❤️',
  'היי אמא, את מהטובות שיש — תהני מהיום 🌄',
  'את מדהימה ומאורגנת, אמא. יופי של תכנית 👏',
  'אמא, כל פרט כאן הוא בזכותך 🌸',
];
function praiseForDay(dayNumber) {
  if (!dayNumber) return MOM_PRAISE[0];
  return MOM_PRAISE[(dayNumber - 1) % MOM_PRAISE.length];
}

// Hebrew month names
const HE_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDateHe(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDate();
  const month = HE_MONTHS[d.getMonth()];
  const weekday = HE_DAYS[d.getDay()];
  return `יום ${weekday}, ${day} ב${month}`;
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
