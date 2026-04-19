// === Mom's Canyon Trip — App Controller ===

const STATE_KEY = 'canyon_trip_2026';
const COORD_OVERRIDES_KEY = 'canyon_trip_coord_overrides';
const REMOVED_STOPS_KEY = 'canyon_trip_removed';

let state = {
  currentDay: 1,
  checked: {},
  dirOpen: {},
  expanded: {},
  bannerDismissed: false,
  showAudit: false,
};
let coordOverrides = {};
let removedStops = {};
let leafletMaps = {};
let currentUtterance = null;
let isAudioPaused = false;

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
  return day.stops.filter(s => !removedStops[s.id]);
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
  state.checked[stopId] = !state.checked[stopId];
  saveState(); render();
}
function toggleDir(key) {
  state.dirOpen[key] = !state.dirOpen[key];
  saveState(); render();
}
function toggleExpanded(stopId) {
  state.expanded[stopId] = !state.expanded[stopId];
  saveState(); render();
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
  removedStops[stopId] = true;
  saveRemovedStops(); render();
}

// --- URLs ---
function mapsNavUrl(c) {
  return c ? `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=driving` : '#';
}
function mapsDirUrl(a, b) {
  return (a && b) ? `https://www.google.com/maps/dir/${a.lat},${a.lng}/${b.lat},${b.lng}` : '#';
}
function phoneUrl(p) {
  return p ? `tel:${p.replace(/[^+\d]/g, '')}` : '#';
}

// --- Distance ---
function haversine(lat1, lon1, lat2, lon2) {
  const R = 3959, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function fmtDist(mi) { return mi < 0.5 ? `${Math.round(mi*5280)} ft` : `${Math.round(mi*10)/10} mi`; }
function fmtTime(mi) {
  const m = Math.round(mi/30*60);
  return m < 60 ? `${m} ${UI.minutes}` : `${Math.floor(m/60)}h ${m%60}m`;
}

// --- Audio with pause/stop ---
function speakHebrew(text, label) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  isAudioPaused = false;
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = 'he-IL';
  currentUtterance.rate = 0.85;
  currentUtterance.onend = () => hideAudioBar();
  currentUtterance.onerror = () => hideAudioBar();
  speechSynthesis.speak(currentUtterance);
  showAudioBar(label || 'מקשיבה...');
}
function toggleAudio() {
  if (!speechSynthesis.speaking) return;
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    isAudioPaused = false;
    document.getElementById('audioPlayPause').textContent = '⏸️';
  } else {
    speechSynthesis.pause();
    isAudioPaused = true;
    document.getElementById('audioPlayPause').textContent = '▶️';
  }
}
function stopAudio() {
  speechSynthesis.cancel();
  hideAudioBar();
}
function showAudioBar(label) {
  const bar = document.getElementById('audioBar');
  bar.hidden = false;
  document.getElementById('audioText').textContent = label;
  document.getElementById('audioPlayPause').textContent = '⏸️';
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
  const map = L.map(id, { zoomControl: false, attributionControl: false, dragging: true, touchZoom: true, scrollWheelZoom: false });
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

function toggleSettings() {} // placeholder

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

// --- Init ---
loadState();
document.addEventListener('DOMContentLoaded', () => { render(); initSwipe(); });
