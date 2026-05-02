// English UI strings and date formatting.
const UI = {
  appTitle: 'Canyon Trip',
  appSubtitle: 'US Canyon Trip 2026',
  day: 'Day',
  stops: 'stops',
  hotel: 'Hotel',
  hotelTonight: 'Tonight at',
  call: 'Call',
  navigate: 'Navigate',
  booking: 'Booking',
  todayPlan: "Today's stops",
  whatToday: "What's on today?",
  listenSummary: 'Listen to summary',
  tellMeMore: 'Tell me about this place',
  askGuide: 'Ask the guide',
  nextDay: 'Next day',
  prevDay: 'Previous day',
  verified: 'Verified',
  warning: 'Warning',
  error: 'Error',
  auditDashboard: 'Trip audit',
  criticalIssues: 'Critical issues',
  warnings: 'Warnings',
  allVerified: 'All verified',
  fix: 'Fix',
  removeStop: 'Remove stop',
  suggestedCoords: 'Suggested coordinates',
  distance: 'Distance',
  minutes: 'min',
  miles: 'km',
  offline: 'Offline mode',
  offlineMsg: 'Directions and maps work without internet',
  downloadMaps: 'Download offline maps',
  downloadMapsGuide: 'Open Google Maps → search the area → tap "Download"',
  addHomeScreen: 'Add to Home Screen',
  noStops: 'No stops scheduled today',
  tripComplete: 'Trip complete!',
  completed: 'completed',
  progress: 'Progress',
  checkCoords: 'Check coordinates',
  impossibleDist: 'Impossible distance — wrong coordinates?',
  suspiciousDist: 'Long distance — check the route',
  placeNotExist: 'Place does not exist',
  openInMaps: 'Open in Maps',
  close: 'Close',
  settings: 'Settings',
  auditMode: 'Audit mode',
  hideCompleted: 'Hide completed',
  resetProgress: 'Reset progress',
  wakeUp: 'Wake up',
  leaveBy: 'Leave by',
  totalDrive: 'Drive',
  totalWalk: 'Walk',
  recommendationsTitle: 'Important recommendations for today',
  recsOpen: 'Open recommendations',
  recsClose: 'Close recommendations',
  // Activity-kind labels (match xlsx legend)
  kindDriving: 'Driving',
  kindStop:    'Quick stop',
  kindWalk:    'Short walk',
  kindHike:    'Hike',
  kindTour:    'Guided tour',
  kindSleep:   'Hotel for the night',
  kindAdd:     'Add to plan',
  kindNote:    'Heads up',
  kindCancel:  'Cancel',
  priorityHigh:   'Urgent',
  priorityMedium: 'Medium',
  priorityLow:    'Optional',
  priorityFix:    'To fix',
  voicePickerTitle: 'Voice',
  voiceTest: 'Test voice',
  voiceSystemDefault: 'Default voice',
  voiceLoading: 'Loading voices…',
};

// Rotating warm lines for mom — shown at the top of every day.
const MOM_PRAISE = [
  'Hi mom, you planned an amazing trip ✨',
  'Hi mom, this trip is going to be wonderful 💛',
  "You're a planning genius, mom 🌟",
  "Mom, this trip is a masterpiece 🎨",
  "Mom, you're doing it — and you're doing it beautifully 🌵",
  'Hi mom, every stop is waiting for you 🌞',
  "Mom, I'm proud of you for all the planning ❤️",
  'Hi mom, you are one of the best — enjoy today 🌄',
  "You're amazing and organized, mom. Beautiful plan 👏",
  'Mom, every detail here is thanks to you 🌸',
];
function praiseForDay(dayNumber) {
  if (!dayNumber) return MOM_PRAISE[0];
  return MOM_PRAISE[(dayNumber - 1) % MOM_PRAISE.length];
}

// English month + weekday names.
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDateHe(dateStr) {
  // Name kept for backward compat — now formats English.
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDate();
  const month = EN_MONTHS[d.getMonth()];
  const weekday = EN_DAYS[d.getDay()];
  return `${weekday}, ${month} ${day}`;
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
