// Weather forecast via Open-Meteo (free, no API key, no rate-limits for personal use).
// One forecast per trip day, coords default to the day's hotel.
// Cached in localStorage for 6 hours so we don't hammer the API on every render.

const WEATHER_CACHE_KEY = 'canyon_trip_weather_v1';
const WEATHER_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const WEATHER_FORECAST_HORIZON_DAYS = 16; // Open-Meteo max free forecast window.

function _weatherCache() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) { return {}; }
}
function _saveWeatherCache(c) {
  try { localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(c)); } catch (_) {}
}
function _weatherKey(lat, lng, date) {
  return `${lat.toFixed(3)},${lng.toFixed(3)}|${date}`;
}

function dayForecastCoords(day) {
  if (day.forecastCoords) return day.forecastCoords;
  if (day.hotel && day.hotel.coordinates) return day.hotel.coordinates;
  const s = (day.stops || []).find(x => x.coordinates);
  return s ? s.coordinates : null;
}

function daysFromToday(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const t = new Date(); t.setHours(12,0,0,0);
  return Math.round((d - t) / 86400000);
}

async function fetchWeatherForDay(day) {
  const coords = dayForecastCoords(day);
  if (!coords) return null;
  const key = _weatherKey(coords.lat, coords.lng, day.date);
  const cache = _weatherCache();
  const cached = cache[key];
  if (cached && Date.now() - cached.fetchedAt < WEATHER_TTL_MS) return cached.data;

  const delta = daysFromToday(day.date);
  // Open-Meteo forecast horizon is ~16 days. Past dates use archive; >16 days ahead → no data.
  if (delta > WEATHER_FORECAST_HORIZON_DAYS) {
    return cached ? cached.data : { outOfRange: true };
  }

  const url = `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${coords.lat}&longitude=${coords.lng}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode` +
    `&temperature_unit=fahrenheit&timezone=America%2FDenver` +
    `&start_date=${day.date}&end_date=${day.date}`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) return cached ? cached.data : null;
    const json = await resp.json();
    const d = json.daily;
    if (!d || !d.time || !d.time.length) return cached ? cached.data : null;
    const data = {
      date: d.time[0],
      tmax: d.temperature_2m_max[0],
      tmin: d.temperature_2m_min[0],
      precip: d.precipitation_sum[0] || 0,
      precipProb: d.precipitation_probability_max[0] || 0,
      code: d.weathercode[0],
    };
    cache[key] = { fetchedAt: Date.now(), data };
    _saveWeatherCache(cache);
    return data;
  } catch (_) {
    return cached ? cached.data : null; // offline: show last-known value
  }
}

function weatherEmoji(code) {
  if (code == null) return '🌤️';
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌤️';
}
function weatherShortHe(code) {
  if (code == null) return '—';
  if (code === 0) return 'בהיר';
  if (code <= 3) return 'מעונן חלקית';
  if (code <= 48) return 'ערפל';
  if (code <= 67) return 'גשום';
  if (code <= 77) return 'שלג';
  if (code <= 82) return 'ממטרים';
  if (code <= 99) return 'סופת רעמים';
  return 'משתנה';
}
function isRainyForecast(w) {
  if (!w || w.outOfRange) return null; // unknown
  // Rain threshold: ≥40% probability or ≥2mm expected accumulation.
  return (w.precipProb >= 40) || (w.precip >= 2);
}

// Prefetch every trip day's forecast (best-effort). Runs in the background after first render.
let _weatherByDay = {};
async function prefetchAllWeather(onEach) {
  if (!window.TRIP_DATA) return;
  const days = TRIP_DATA.days || [];
  for (const day of days) {
    const data = await fetchWeatherForDay(day);
    if (data) _weatherByDay[day.dayNumber] = data;
    if (typeof onEach === 'function') onEach(day.dayNumber, data);
  }
}

// Synchronous getter for already-cached weather. Used by render functions that
// can't await. Returns null if nothing cached yet.
function getWeatherForDay(dayNum) {
  if (_weatherByDay[dayNum]) return _weatherByDay[dayNum];
  const day = (window.TRIP_DATA && TRIP_DATA.days || []).find(d => d.dayNumber === dayNum);
  if (!day) return null;
  const coords = dayForecastCoords(day);
  if (!coords) return null;
  const cache = _weatherCache();
  const cached = cache[_weatherKey(coords.lat, coords.lng, day.date)];
  if (cached && cached.data) {
    _weatherByDay[dayNum] = cached.data;
    return cached.data;
  }
  return null;
}

// Trigger a fetch for a single day on-demand (e.g. when she taps "activate").
// Re-renders when done so the conditions card populates.
async function refreshWeatherForDay(dayNum) {
  const day = (window.TRIP_DATA && TRIP_DATA.days || []).find(d => d.dayNumber === dayNum);
  if (!day) return;
  // Clear the per-key cache so we hit the network fresh.
  const coords = dayForecastCoords(day);
  if (coords) {
    const cache = _weatherCache();
    delete cache[_weatherKey(coords.lat, coords.lng, day.date)];
    _saveWeatherCache(cache);
  }
  const data = await fetchWeatherForDay(day);
  if (data) _weatherByDay[dayNum] = data;
  if (typeof render === 'function') render();
}

// Auto-fetch on demand — kicks a background fetch if no data and reports back
// (typically called once per day-render, debounced by cache).
function ensureWeatherForDay(dayNum) {
  if (getWeatherForDay(dayNum) !== null) return false;
  const day = (window.TRIP_DATA && TRIP_DATA.days || []).find(d => d.dayNumber === dayNum);
  if (!day) return false;
  fetchWeatherForDay(day).then(data => {
    if (data) {
      _weatherByDay[dayNum] = data;
      if (typeof render === 'function') render();
    }
  }).catch(() => {});
  return true;
}

// Compute weather-derived warnings for a day. Each entry is {icon, text, urgent}.
// Used by the day-prep card to surface conditions-driven risks (heat for 60+,
// storms triggering flash floods in slot canyons, cold/wind for high-altitude).
function getWeatherWarnings(day, w) {
  if (!w || w.outOfRange) return [];
  const out = [];
  const tmaxC = w.tmax != null ? (w.tmax - 32) * 5 / 9 : null;
  const tminC = w.tmin != null ? (w.tmin - 32) * 5 / 9 : null;

  if (tmaxC !== null && tmaxC >= 32) {
    out.push({
      icon: '🥵', urgent: true,
      text: `חום קיצוני היום (${Math.round(tmaxC)}°C). בגיל 60+ סימני מכת חום מופיעים מאוחר. מים כל 20 דק', כובע, מנוחה בצל. אם העור יבש וחם בלי הזעה — מיד 911.`
    });
  } else if (tmaxC !== null && tmaxC >= 28) {
    out.push({
      icon: '☀️', urgent: false,
      text: `חם היום (${Math.round(tmaxC)}°C). שתייה כל חצי שעה גם אם לא צמאה.`
    });
  }
  if (tminC !== null && tminC <= 5) {
    out.push({
      icon: '🥶', urgent: false,
      text: `קר בבוקר (${Math.round(tminC)}°C). שכבות, כפפות, כובע — קל לפשוט בהמשך.`
    });
  }
  if (w.code != null && w.code >= 95) {
    out.push({
      icon: '⛈️', urgent: true,
      text: `סופת רעמים בתחזית. סלעים חשופים (Bryce, Canyonlands, Delicate Arch) = סכנת ברק. להוריד מהפסגות עד הצהריים.`
    });
  }
  if (w.precip >= 2 || w.precipProb >= 40) {
    out.push({
      icon: '🌧️', urgent: true,
      text: `סיכון גבוה לגשם (${w.precipProb}%, ${w.precip}mm). אם בתוכנית קניון צר — לבטל. שיטפון פתאומי הוא הסיכון הקטלני באזור.`
    });
  }
  return out;
}
