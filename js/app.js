// === Mom's Canyon Trip — App Controller ===

const STATE_KEY = 'canyon_trip_2026';
const COORD_OVERRIDES_KEY = 'canyon_trip_coord_overrides';
const REMOVED_STOPS_KEY = 'canyon_trip_removed';

let state = {
  currentDay: 1,
  checked: {},
  dirOpen: {},
  expanded: {},
  recsOpen: {},
  nearbyOpen: {},
  pretripDone: {},          // checklist itemId -> true
  pretripDismissed: false,
  showPretrip: false,
  addedStops: {},           // dayNum (string) -> [item, item, ...]; items added from nearby
  fuelLevel: {},            // dayNum (string) -> 'full' | 'half' | 'low'
  fuelDismissed: {},        // dayNum (string) -> true once she sets a value
  bannerDismissed: false,
  showAudit: false,
  voiceName: null,          // English voice mom picked
  hebrewVoiceName: null,    // Hebrew voice mom picked (separate so changing one doesn't break the other)
  dayRoute: {},             // per-day route override: 'dry' | 'wet' | 'auto' (Day 14 etc.)
};
let coordOverrides = {};
let removedStops = {};
let leafletMaps = {};

// Shared drive-time model. Used by both the timeline total and the dir cards.
const AVG_DRIVE_MPH = 25;
const ROAD_WINDINESS = 1.35;
const EARTH_RADIUS_MI = 3959;

// --- Persistence ---
function saveState() {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e) {}
}
function loadState() {
  try {
    const s = localStorage.getItem(STATE_KEY);
    if (s) state = { ...state, ...JSON.parse(s) };
    const co = localStorage.getItem(COORD_OVERRIDES_KEY);
    if (co) coordOverrides = JSON.parse(co);
    const rs = localStorage.getItem(REMOVED_STOPS_KEY);
    if (rs) removedStops = JSON.parse(rs);
  } catch(e) {}
}
function saveCoordOverrides() {
  try { localStorage.setItem(COORD_OVERRIDES_KEY, JSON.stringify(coordOverrides)); } catch(e) {}
}
function saveRemovedStops() {
  try { localStorage.setItem(REMOVED_STOPS_KEY, JSON.stringify(removedStops)); } catch(e) {}
}

// --- Data helpers ---
function getCurrentDay() {
  return TRIP_DATA.days.find(d => d.dayNumber === state.currentDay) || TRIP_DATA.days[0];
}
function getDayStops(day) {
  const original = day.stops.filter(s => !removedStops[s.id]);
  const added = (state.addedStops && state.addedStops[String(day.dayNumber)]) || [];
  return [...original, ...added];
}

// Returns stops in CHRONOLOGICAL order — walks day.schedule and interleaves
// added items right after their afterStopId. Used by the route map so the
// polyline draws through added stops at the correct point.
function getDayStopsOrdered(day) {
  const original = day.stops.filter(s => !removedStops[s.id]);
  const byId = {}; for (const s of original) byId[s.id] = s;
  const added = (state.addedStops && state.addedStops[String(day.dayNumber)]) || [];
  const addedAfter = {};
  const addedAtEnd = [];
  for (const a of added) {
    if (a.afterStopId && byId[a.afterStopId]) {
      (addedAfter[a.afterStopId] = addedAfter[a.afterStopId] || []).push(a);
    } else {
      addedAtEnd.push(a);
    }
  }

  // Build the chronological order by walking day.schedule. For each scheduled
  // stop row with a known stopId, emit the stop, then any items anchored to it.
  const seen = new Set();
  const out = [];
  for (const row of (day.schedule || [])) {
    if (!row.stopId || !byId[row.stopId] || seen.has(row.stopId)) continue;
    out.push(byId[row.stopId]);
    seen.add(row.stopId);
    for (const a of (addedAfter[row.stopId] || [])) out.push(a);
  }
  // Any original stops not referenced in schedule (rare — orphans) — append.
  for (const s of original) {
    if (!seen.has(s.id)) out.push(s);
  }
  // Items with no/unknown afterStopId at the very end.
  for (const a of addedAtEnd) out.push(a);
  return out;
}
// Soft-removed stops that originally belonged to this day, so we can show them
// in the "removed" subsection of nearby for revival.
function getRemovedStopsForDay(day) {
  return (day.stops || []).filter(s => removedStops[s.id]);
}
function getStopCoords(stop) {
  return coordOverrides[stop.id] || stop.coordinates;
}
function getDayProgress(day) {
  const stops = getDayStops(day);
  const c = stops.filter(s => state.checked[s.id]).length;
  return { checked: c, total: stops.length, pct: stops.length ? Math.round(c / stops.length * 100) : 0 };
}
function getTotalProgress() {
  let c = 0, t = 0;
  for (const day of TRIP_DATA.days) {
    const stops = getDayStops(day);
    t += stops.length;
    c += stops.filter(s => state.checked[s.id]).length;
  }
  return { checked: c, total: t, pct: t ? Math.round(c / t * 100) : 0 };
}

// --- Actions ---
function toggleCheck(stopId) {
  const wasChecked = !!state.checked[stopId];
  state.checked[stopId] = !state.checked[stopId];
  saveState(); render();
  // Newly-completed stop on the current day → ask "what's next" so she's
  // never left wondering. Skip the modal for unchecking and for off-day clicks.
  if (!wasChecked && state.checked[stopId]) {
    showStopDoneModal(stopId);
  }
}

function findStopAndDay(stopId) {
  for (const d of TRIP_DATA.days) {
    if ((d.stops || []).some(s => s.id === stopId)) {
      return { stop: d.stops.find(s => s.id === stopId), day: d };
    }
    const added = (state.addedStops && state.addedStops[String(d.dayNumber)]) || [];
    const a = added.find(s => s.id === stopId);
    if (a) return { stop: a, day: d };
  }
  return { stop: null, day: null };
}

function showStopDoneModal(stopId) {
  const { stop, day } = findStopAndDay(stopId);
  if (!stop || !day) return;
  // Detect last-stop-of-day so we lead with "done for today".
  const stops = getDayStops(day);
  const allDone = stops.every(s => state.checked[s.id]);
  const escName = String(stop.name).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-icon">✓</div>
      <div class="modal-title">סימנת ${escName} כהושלם</div>
      <div class="modal-sub">${allDone ? 'סיימת את כל היום! 🎉' : 'מה הלאה?'}</div>
      <div class="modal-actions">
        ${allDone ? '' : `<button class="modal-btn primary" onclick="closeModal()">✅ ממשיכה לפי התוכנית</button>`}
        <button class="modal-btn" onclick="closeModal();openNearbyForDay(${day.dayNumber})">✨ הציעי מקום חדש</button>
        <button class="modal-btn" onclick="closeModal()">🏁 ${allDone ? 'מעולה' : 'סיימתי להיום'}</button>
      </div>
    </div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}

function closeModal() {
  const o = document.querySelector('.modal-overlay');
  if (o) o.remove();
}

function openNearbyForDay(dayNum) {
  if (!dayNum) return;
  state.nearbyOpen = state.nearbyOpen || {};
  state.nearbyOpen[String(dayNum)] = true;
  saveState(); render();
  setTimeout(() => {
    const el = document.querySelector('.nearby-card');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}
function toggleDir(key) {
  state.dirOpen[key] = !state.dirOpen[key];
  saveState(); render();
}
// Stops where flash-flood-in-slot-canyon is a real risk. Expanding any of these
// triggers a one-time-per-session warning modal so she remembers to check
// upstream forecast.
const SLOT_CANYON_STOPS = {
  // Day 13 — Hole-in-the-Rock area
  'd13-s2': true,  // Peek-a-Boo
  'd13-s3': true,  // Spooky
  'd13-s4': true,  // Brimstone
  'd13-s5': true,  // Dry Fork Narrows
  // Day 16 — Antelope (guided but still slot canyons)
  'd16-s1': true,  // Lower Antelope
  'd16-s2': true,  // Upper Antelope
  'd16-s3': true,  // Belly of the Dragon (drainage tunnel)
  // Day 21 — Kanarra
  'd21-s1': true,  // Kanarra Falls
  // Day 6 — Little Wild Horse
  'd6-s2': true,
  // Day 23 — Ice Box Canyon (mild slot)
  'd23-s5': true,
};

let _slotWarningShown = {};
function showSlotWarning(stopName) {
  if (_slotWarningShown[stopName]) return;
  _slotWarningShown[stopName] = true;
  const safe = String(stopName).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay slot-warning';
  overlay.innerHTML = `
    <div class="modal-card slot-warning-card">
      <div class="modal-icon flood">🌊</div>
      <div class="modal-title">קניון צר — סכנת שיטפון פתאומי</div>
      <div class="modal-sub">${safe}</div>
      <div class="slot-warning-body">
        <p><b>לפני שנכנסים לסלוט:</b></p>
        <ul>
          <li>בדקי תחזית גשם ל-24 שעות הבאות לכל אזור הניקוז של הקניון (לא רק במקום שאת בו).</li>
          <li>אם יש <b>אפילו עננים</b> במעלה הזרם — לסגת מיד.</li>
          <li>שיטפון יכול להגיע מגשם <b>שלא ירד עליך</b>, מ-100+ ק"מ הלאה.</li>
          <li>סימן אזהרה: בולי עץ תקועים גבוה בקירות = כך גבוה הגיע השיטפון הקודם.</li>
          <li>אם שומעת רעם רחוק או רואה עכירות במים — צאי <b>מיד</b> לפינה גבוהה.</li>
        </ul>
        <p class="slot-warning-stat">בקטעים האלה היו מקרי מוות: Buckskin (4, 2023), Lower Antelope (11, 1997).</p>
      </div>
      <div class="modal-actions">
        <button class="modal-btn primary" onclick="closeModal()">הבנתי, ממשיכה</button>
      </div>
    </div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
}

function toggleExpanded(stopId) {
  const wasExpanded = !!state.expanded[stopId];
  state.expanded[stopId] = !state.expanded[stopId];
  saveState(); render();
  // Newly expanded + this is a known slot canyon → warn once per session.
  if (!wasExpanded && state.expanded[stopId] && SLOT_CANYON_STOPS[stopId]) {
    const { stop } = findStopAndDay(stopId);
    if (stop) showSlotWarning(stop.name);
  }
}
function toggleRecsOpen(dayNum) {
  state.recsOpen = state.recsOpen || {};
  state.recsOpen[dayNum] = !state.recsOpen[dayNum];
  saveState(); render();
}
function toggleNearbyOpen(dayNum, section) {
  state.nearbyOpen = state.nearbyOpen || {};
  const key = section ? `${dayNum}:${section}` : `${dayNum}`;
  // Default: closed for both top-level and sub-sections. Forces an explicit
  // category pick rather than dumping all categories on her at once.
  // Exception: the "removed" sub-section defaults open (so revival is visible).
  let current;
  if (state.nearbyOpen[key] === undefined) {
    current = (section === 'removed');
  } else {
    current = state.nearbyOpen[key];
  }
  state.nearbyOpen[key] = !current;
  saveState(); render();
}
function setDayRoute(dayNum, choice) {
  // 'auto' | 'dry' | 'wet'
  state.dayRoute = state.dayRoute || {};
  state.dayRoute[dayNum] = choice;
  saveState(); render();
}
// Which route is effectively active for a day, given the user's choice + forecast.
function effectiveRoute(day) {
  const pref = (state.dayRoute || {})[day.dayNumber] || 'auto';
  if (pref === 'dry' || pref === 'wet') return pref;
  if (typeof getWeatherForDay === 'function') {
    const w = getWeatherForDay(day.dayNumber);
    const rainy = (typeof isRainyForecast === 'function') ? isRainyForecast(w) : null;
    if (rainy === true)  return 'wet';
    if (rainy === false) return 'dry';
  }
  return 'dry'; // sensible default before forecast loads
}
function goToDay(dayNum) {
  state.currentDay = dayNum;
  saveState(); render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function nextDay() {
  const idx = TRIP_DATA.days.findIndex(d => d.dayNumber === state.currentDay);
  if (idx < TRIP_DATA.days.length - 1) goToDay(TRIP_DATA.days[idx + 1].dayNumber);
}
function prevDay() {
  const idx = TRIP_DATA.days.findIndex(d => d.dayNumber === state.currentDay);
  if (idx > 0) goToDay(TRIP_DATA.days[idx - 1].dayNumber);
}
function dismissBanner() {
  state.bannerDismissed = true;
  saveState(); render();
}

// Pre-trip verification checklist — accessed from header. 9 items mom must
// confirm BEFORE flying. Each persists in state.pretripDone.
const PRETRIP_ITEMS = [
  { id: 'antelope',   icon: '🎫', urgent: true,  title: 'אישור הזמנת Antelope Canyon',
    detail: 'יום 16. מוכר מראש 3-4 שבועות. בלי זה — אין כניסה. אשרי שם המפעיל, שעה (זמן יוטה במאי), ומספר הזמנה.' },
  { id: 'fiery',      icon: '🎫', urgent: true,  title: 'אישור היתר Fiery Furnace',
    detail: 'יום 3. שמרי את הקבלה במייל ובצילום מסך. התחלה ב-8:00 בבוקר חובה — איחור = ביטול ההיתר.' },
  { id: 'kanarra',    icon: '🎫', urgent: true,  title: 'אישור היתר Kanarra Falls',
    detail: 'יום 21. 15 דולר לאדם, 150 ביום. להזמין ב-kanarrafalls.com. בלי היתר — אין כניסה.' },
  { id: 'redrock',    icon: '🎫', urgent: true,  title: 'הזמנת timed-entry ל-Red Rock Canyon',
    detail: 'יום 23. חובה בין 8:00-17:00. להזמין ב-Recreation.gov. בלי הזמנה — להיכנס לפני 8:00 או אחרי 17:00.' },
  { id: 'dreamland',  icon: '🎫', urgent: true,  title: 'אישור Dreamland Safari (White Pocket)',
    detail: 'יום 17. אשרי שעה ומיקום איסוף. הסיור הוא הדרך היחידה ל-White Pocket בלי מיומנות נהיגת 4 על 4.' },
  { id: 'cash',       icon: '💵', urgent: true,  title: '300-400 דולר במזומן עם שטרות קטנים',
    detail: 'שטרות של דולר אחד, 5 ו-10 דולר. דרושים לטיפים, להיתרי Bureau of Land Management (כ-6 דולר במזומן בלבד), ותדלוק כפרי.' },
  { id: 'meds',       icon: '💊', urgent: true,  title: '30+7 ימי תרופות יומיות',
    detail: 'אין בית מרקחת אמיתי בין האנקסוויל/Capitol Reef ל-Escalante (~130 ק"מ). מילוי מראש.' },
  { id: 'maps',       icon: '🗺️', urgent: true,  title: 'הורדת מפות אופליין',
    detail: 'Mapy.com (חינם, מצוין למסלולים) + AllTrails Pro (מצוין לפארקים בארה"ב, כ-36 דולר לשנה) + Google Maps אופליין לכל אזור הטיול.' },
  { id: 'inreach',    icon: '🛰️', urgent: false, title: 'Garmin inReach Mini 2 (אופציונלי)',
    detail: 'השכרה כ-50-80 דולר לשבוע מ-REI Moab או Springdale. שליחת SOS לוויני באזורים בלי קליטה (Cathedral Valley, White Pocket, כביש Hole-in-the-Rock).' },
  { id: 'hotels',     icon: '🏨', urgent: true,  title: 'אישור כתובות מלון',
    detail: 'בייחוד "Zion\'s Most Wanted Hotel" ו-"Economy Inn Springdale" — לאמת כתובות מדויקות מאישורי ההזמנה.' },
];

function togglePretripChecklist() {
  state.showPretrip = !state.showPretrip;
  saveState(); render();
}
function togglePretripItem(id) {
  state.pretripDone = state.pretripDone || {};
  state.pretripDone[id] = !state.pretripDone[id];
  saveState(); render();
}
function pretripPendingCount() {
  const done = state.pretripDone || {};
  return PRETRIP_ITEMS.filter(it => it.urgent && !done[it.id]).length;
}
function toggleAuditScreen() {
  state.showAudit = !state.showAudit;
  if (state.showAudit) renderAuditScreen();
  else {
    const o = document.getElementById('auditOverlay');
    if (o) o.innerHTML = '';
  }
}
function applyCoordFix(stopId, lat, lng) {
  coordOverrides[stopId] = { lat, lng };
  saveCoordOverrides(); render();
}
function removeStop(stopId) {
  // Soft-remove: store metadata so we can show in "removed" section and revive.
  removedStops[stopId] = { date: new Date().toISOString(), source: 'manual' };
  saveRemovedStops(); render();
}
function reviveStop(stopId) {
  delete removedStops[stopId];
  saveRemovedStops(); render();
}

// --- Add from nearby ---
// "Current position" = the last checked stop chronologically. Added items go
// right after it, so when she's at stop N and adds something, the new item
// appears between N and N+1, matching her real timeline.
function getCurrentStopForDay(day) {
  const stops = (day.stops || []);
  let lastChecked = null;
  for (const s of stops) {
    if (state.checked[s.id] && !removedStops[s.id]) lastChecked = s;
  }
  return lastChecked;  // null if nothing checked → item goes at start of day
}

function addNearbyToDay(dayNum, itemKey, position) {
  // position: 'now' (default — after current/last-checked stop) or 'end' (append)
  if (typeof TRIP_NEARBY === 'undefined' || !TRIP_NEARBY[dayNum]) return;
  const [section, idx] = itemKey.split(':');
  const list = TRIP_NEARBY[dayNum][section] || [];
  const item = list[parseInt(idx, 10)];
  if (!item) return;

  const dayKey = String(dayNum);
  state.addedStops = state.addedStops || {};
  state.addedStops[dayKey] = state.addedStops[dayKey] || [];
  if (state.addedStops[dayKey].find(x => x.sourceKey === itemKey)) return;  // dedup

  const day = TRIP_DATA.days.find(d => d.dayNumber === dayNum);
  const currentStop = (position === 'end') ? null : (day ? getCurrentStopForDay(day) : null);

  state.addedStops[dayKey].push({
    id: `added-d${dayNum}-${Date.now()}`,
    sourceKey: itemKey,
    name: item.name,
    emoji: '✨',
    type: item.type || 'נוסף',
    coordinates: (item.lat && item.lng) ? { lat: item.lat, lng: item.lng } : null,
    tip: item.desc || '',
    audit: { status: 'verified', issues: [] },
    isAdded: true,
    afterStopId: currentStop ? currentStop.id : null,
    insertedAt: new Date().toISOString(),
  });
  saveState(); render();
}
function removeAddedFromDay(dayNum, addedId) {
  const dayKey = String(dayNum);
  if (!state.addedStops || !state.addedStops[dayKey]) return;
  state.addedStops[dayKey] = state.addedStops[dayKey].filter(x => x.id !== addedId);
  saveState(); render();
}

// --- Fuel ---
function setFuelLevel(dayNum, level) {
  const dayKey = String(dayNum);
  state.fuelLevel = state.fuelLevel || {};
  state.fuelDismissed = state.fuelDismissed || {};
  state.fuelLevel[dayKey] = level;
  state.fuelDismissed[dayKey] = true;
  saveState(); render();
}
function clearFuelLevel(dayNum) {
  const dayKey = String(dayNum);
  if (state.fuelLevel) delete state.fuelLevel[dayKey];
  if (state.fuelDismissed) delete state.fuelDismissed[dayKey];
  saveState(); render();
}

// --- URLs ---
// Dev-only origin override. Append `?mock=las` to the URL to test nav links
// from somewhere other than the user's actual GPS (useful when developing
// thousands of miles from the trip route).
const MOCK_ORIGINS = {
  las: { lat: 36.0840, lng: -115.1537 },  // Harry Reid Intl Airport, Las Vegas
};
function getMockOrigin() {
  try {
    const m = new URLSearchParams(location.search).get('mock');
    return (m && MOCK_ORIGINS[m.toLowerCase()]) || null;
  } catch (e) { return null; }
}
function mapsNavUrl(c) {
  if (!c) return '#';
  // dir_action=navigate forces GPS and ignores explicit origin, so we drop it
  // in mock mode and just show the route from the mock origin instead.
  const mock = getMockOrigin();
  if (mock) {
    return `https://www.google.com/maps/dir/?api=1&origin=${mock.lat},${mock.lng}&destination=${c.lat},${c.lng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=driving&dir_action=navigate`;
}
function mapsDirUrl(a, b) {
  return (a && b) ? `https://www.google.com/maps/dir/${a.lat},${a.lng}/${b.lat},${b.lng}` : '#';
}

// Mapy.com (formerly Mapy.cz) — Czech mapping service with excellent offline
// outdoor maps. URL is an Android App Link: opens the app if installed
// (cz.seznam.mapy), falls back to mapy.com web. NOTE: longitude comes BEFORE
// latitude in their URL — easy to get wrong.
function mapyShowUrl(c) {
  if (!c) return '#';
  return `https://mapy.com/fnc/v1/showmap?mapset=outdoor&center=${c.lng},${c.lat}&zoom=16&marker=true`;
}
function mapyRouteUrl(to, from) {
  if (!to) return '#';
  const start = from ? `start=${from.lng},${from.lat}&` : '';
  return `https://mapy.com/fnc/v1/route?${start}end=${to.lng},${to.lat}&routeType=car_fast_traffic&navigate=true`;
}

// AllTrails — opens specific trail page. Works as an App Link on Android,
// opens the app if installed (com.alltrails.alltrails), web otherwise.
// Slug must be hand-curated per trail (no public lookup API).
function alltrailsTrailUrl(stopId) {
  if (typeof ALLTRAILS_SLUGS === 'undefined') return null;
  const slug = ALLTRAILS_SLUGS[stopId];
  return slug ? `https://www.alltrails.com/trail/${slug}` : null;
}

// Fallback: search AllTrails by name. Used when no verified slug exists.
// Opens search results page; mom taps the right one. Less reliable than a
// direct slug (no app-link guarantee on search URLs) but better than no button.
function alltrailsSearchUrl(name) {
  if (!name) return null;
  return `https://www.alltrails.com/search?q=${encodeURIComponent(name)}`;
}
function phoneUrl(p) {
  return p ? `tel:${p.replace(/[^+\d]/g, '')}` : '#';
}

// --- Distance ---
function haversine(lat1, lon1, lat2, lon2) {
  const dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function fmtDist(mi) { return mi < 0.5 ? `${Math.round(mi*5280)} ft` : `${Math.round(mi*10)/10} mi`; }
// Same model as render.js driveMinFromDist — keep the two in sync via these constants.
function fmtTime(mi) {
  const m = Math.round(mi * ROAD_WINDINESS / AVG_DRIVE_MPH * 60);
  return m < 60 ? `${m} ${UI.minutes}` : `${Math.floor(m/60)}h ${m%60}m`;
}

// --- Audio with pause/stop ---
// --- Voice routing ---
// Auto-detects the text language (Hebrew vs English) and picks an appropriate
// system voice. Mom picks her preferred Hebrew voice and English voice
// independently — switching one does not affect the other.
const HEBREW_RX = /[֐-׿]/;
function isHebrewText(text) { return HEBREW_RX.test(String(text || '')); }

function allVoices() {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices() || [];
}
function englishVoices() {
  return allVoices().filter(v => (v.lang || '').toLowerCase().startsWith('en'));
}
function hebrewVoices() {
  return allVoices().filter(v => (v.lang || '').toLowerCase().startsWith('he'));
}
function getSelectedVoice(forText) {
  // Pick voice by text language. Falls back to any available voice if the
  // requested language has none installed (e.g. Android without Hebrew TTS pack).
  const wantHebrew = isHebrewText(forText);
  const pool = wantHebrew ? hebrewVoices() : englishVoices();
  const stored = wantHebrew ? state.hebrewVoiceName : state.voiceName;
  if (stored) {
    const found = pool.find(v => v.name === stored);
    if (found) return found;
  }
  if (!pool.length) {
    // No matching-language voice installed — try any voice rather than going silent.
    return allVoices()[0] || null;
  }
  if (wantHebrew) return pool[0];
  // English: prefer well-known male voices if present.
  const malePreferred = /daniel|alex|fred|oliver|james|aaron|mark|david|ryan|tom|paul|arthur/i;
  return pool.find(v => malePreferred.test(v.name)) || pool[0];
}
function setVoice(name) {
  state.voiceName = name || null;
  saveState();
  speakText("Hi mom, this is how I'll sound.", 'דוגמה לקול');
}
function setHebrewVoice(name) {
  state.hebrewVoiceName = name || null;
  saveState();
  speakText("שלום אמא, ככה אני נשמע.", 'דוגמה לקול');
}

function speakText(text, label, lang) {
  if (!('speechSynthesis' in window)) {
    showToast('הדפדפן לא תומך בקול — נסי דפדפן אחר.');
    return;
  }
  if (!text || !String(text).trim()) {
    showToast('אין טקסט להקראה.');
    return;
  }
  // Check that we have at least one voice in the right language.
  const wantHebrew = isHebrewText(text);
  const heCount = hebrewVoices().length;
  const enCount = englishVoices().length;
  if (wantHebrew && heCount === 0) {
    if (enCount > 0) {
      showToast('קול עברי לא מותקן. בלחיצה — הקראה בקול אנגלי (יישמע מוזר). להתקנה: Settings → Time & Language → Speech → Add voice → Hebrew.', 8000);
    } else {
      showToast('אין קולות מותקנים בדפדפן. ב-Windows: Settings → Time & Language → Speech → Add voice.', 8000);
      return;
    }
  } else if (!wantHebrew && enCount === 0) {
    showToast('קול אנגלי לא מותקן.', 5000);
    if (heCount === 0) return;
  }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = getSelectedVoice(text);
    u.lang = voice && voice.lang ? voice.lang : (lang || (wantHebrew ? 'he-IL' : 'en-US'));
    u.rate = 0.92;
    if (voice) u.voice = voice;
    u.onend   = () => hideAudioBar();
    u.onerror = (e) => {
      hideAudioBar();
      showToast('הקול נכשל: ' + (e.error || 'שגיאה לא ידועה'));
    };
    speechSynthesis.speak(u);
    showAudioBar(label || 'מקשיבה...');
  } catch (e) {
    hideAudioBar();
    showToast('שגיאה בהפעלת קול: ' + e.message);
  }
}

// Escape a string so it's safe inside an inline onclick="...speakText('HERE','...')"
// HTML attribute. Two layers needed: JS string escaping (\, ', newlines) AND
// HTML attribute escaping (&, ", <, >). Without the HTML layer, a double quote
// in the text breaks out of the attribute and the whole handler dies silently.
function escForOnclick(s) {
  const jsEsc = String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
  return jsEsc
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Lightweight toast — simple bottom message, auto-dismisses.
function showToast(msg, ms) {
  ms = ms || 4000;
  let el = document.getElementById('appToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'appToast';
    el.className = 'app-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}
// Back-compat alias.
function speakHebrew(text, label) { return speakText(text, label); }

// speechSynthesis populates voices asynchronously on some browsers.
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    // If the voice picker is currently rendered, re-render so options appear.
    if (document.getElementById('voicePicker')) render();
  };
}

function toggleAudio() {
  if (!('speechSynthesis' in window) || !speechSynthesis.speaking) return;
  const btn = document.getElementById('audioPlayPause');
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    if (btn) btn.textContent = '⏸';
  } else {
    speechSynthesis.pause();
    if (btn) btn.textContent = '▶';
  }
}
function stopAudio() {
  speechSynthesis.cancel();
  hideAudioBar();
}
function showAudioBar(label) {
  const bar = document.getElementById('audioBar');
  if (!bar) return;
  bar.hidden = false;
  const txt = document.getElementById('audioText');
  if (txt) txt.textContent = label;
  const btn = document.getElementById('audioPlayPause');
  if (btn) btn.textContent = '⏸';
}
function hideAudioBar() {
  document.getElementById('audioBar').hidden = true;
}

// --- Leaflet ---
function initStopMap(id, coords, name) {
  if (leafletMaps[id]) { leafletMaps[id].remove(); delete leafletMaps[id]; }
  const el = document.getElementById(id);
  if (!el || !coords) return;
  const map = L.map(id, {
    center: [coords.lat, coords.lng], zoom: 14,
    zoomControl: false, attributionControl: false,
    dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
  L.marker([coords.lat, coords.lng]).addTo(map).bindPopup(`<b>${name}</b>`);
  leafletMaps[id] = map;
}

function initRouteMap(id, stops) {
  if (leafletMaps[id]) { leafletMaps[id].remove(); delete leafletMaps[id]; }
  const el = document.getElementById(id);
  if (!el) return;
  const valid = stops.filter(s => getStopCoords(s));
  if (valid.length < 2) return;
  const pts = valid.map(s => { const c = getStopCoords(s); return [c.lat, c.lng]; });
  const map = L.map(id, { zoomControl: true, attributionControl: false, dragging: true, touchZoom: true, scrollWheelZoom: true, doubleClickZoom: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 16 }).addTo(map);
  L.polyline(pts, { color: '#c85a3a', weight: 3, opacity: 0.7, dashArray: '8 6' }).addTo(map);
  valid.forEach((s, i) => {
    const c = getStopCoords(s);
    const bg = i === 0 ? '#3a8a4a' : i === valid.length-1 ? '#c85a3a' : '#2d7a9c';
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:26px;height:26px;border-radius:50%;background:${bg};color:#fff;font-weight:900;font-size:11px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${i+1}</div>`,
      iconSize: [26, 26], iconAnchor: [13, 13],
    });
    L.marker([c.lat, c.lng], { icon }).addTo(map).bindPopup(`<b>${s.emoji} ${s.name}</b>`);
  });
  map.fitBounds(L.latLngBounds(pts).pad(0.15));
  leafletMaps[id] = map;
}

// Route segment map: shows just 2 stops with a line between them
function initRouteSegmentMap(id, fromStop, toStop) {
  if (leafletMaps[id]) { leafletMaps[id].remove(); delete leafletMaps[id]; }
  const el = document.getElementById(id);
  if (!el) return;
  const fc = getStopCoords(fromStop), tc = getStopCoords(toStop);
  if (!fc || !tc) return;

  const map = L.map(id, {
    zoomControl: false, attributionControl: false,
    dragging: true, touchZoom: true, scrollWheelZoom: false,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 16 }).addTo(map);

  // Route line
  L.polyline([[fc.lat, fc.lng], [tc.lat, tc.lng]], {
    color: '#1a73e8', weight: 4, opacity: 0.8, dashArray: '10 6'
  }).addTo(map);

  // From marker (green, current)
  const fromIcon = L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:#1e8e3e;color:#fff;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
    iconSize: [32, 32], iconAnchor: [16, 16],
  });
  L.marker([fc.lat, fc.lng], { icon: fromIcon }).addTo(map)
    .bindPopup(`<b>${fromStop.emoji} ${fromStop.name}</b><br>את כאן`);

  // To marker (blue, next)
  const toIcon = L.divIcon({
    className: '',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:#1a73e8;color:#fff;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">▶</div>`,
    iconSize: [32, 32], iconAnchor: [16, 16],
  });
  L.marker([tc.lat, tc.lng], { icon: toIcon }).addTo(map)
    .bindPopup(`<b>${toStop.emoji} ${toStop.name}</b><br>התחנה הבאה`);

  // Fit both points
  map.fitBounds([[fc.lat, fc.lng], [tc.lat, tc.lng]], { padding: [30, 30] });

  leafletMaps[id] = map;
}

// --- Swipe gesture (simple, no Swiper needed) ---
let swipeX = 0, swipeY = 0;
function initSwipe() {
  const el = document.getElementById('app');
  el.addEventListener('touchstart', e => { swipeX = e.touches[0].clientX; swipeY = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - swipeX;
    const dy = e.changedTouches[0].clientY - swipeY;
    if (Math.abs(dx) > 80 && Math.abs(dy) < 50) {
      if (dx < 0) nextDay(); else prevDay();
    }
  }, { passive: true });
}

// --- Header scroll shadow ---
function initScrollShadow() {
  const header = document.querySelector('.header');
  if (!header) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 8);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// --- Init ---
loadState();
document.addEventListener('DOMContentLoaded', () => {
  render();
  initSwipe();
  initScrollShadow();
  // Background-fetch weather for every trip day, re-render as each arrives so the
  // chips populate without blocking first paint.
  if (typeof prefetchAllWeather === 'function') {
    prefetchAllWeather((dayNumber) => {
      if (dayNumber === state.currentDay) render();
    });
  }
});
