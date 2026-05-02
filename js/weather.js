// Weather forecast via Open-Meteo (free, no API key, no rate-limits for personal use).
// One forecast per trip day, coords default to the day's hotel.
// Cached in localStorage for 6 hours so we don't hammer the API on every render.

const WEATHER_CACHE_KEY = 'canyon_trip_weather_v2';
const WEATHER_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
// Open-Meteo's free forecast covers today + 15 days (16-day window inclusive).
// Day delta of 16 (= today + 16 days) is outside the window and returns 400.
const WEATHER_FORECAST_HORIZON_DAYS = 15;

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
    if (!resp.ok) {
      // 400 typically = date past Open-Meteo's horizon. Cache as outOfRange so
      // we don't keep re-fetching the same dead query on every render.
      if (resp.status === 400) {
        const data = { outOfRange: true };
        cache[key] = { fetchedAt: Date.now(), data };
        _saveWeatherCache(cache);
        return data;
      }
      return cached ? cached.data : null;
    }
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
function weatherShort(code) {
  if (code == null) return '—';
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Mixed';
}
// Back-compat alias — render.js calls weatherShortHe in places.
const weatherShortHe = weatherShort;
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
// Cross-references the day's actual stops (via STOP_HAZARDS) so warnings name
// the specific places at risk — mom doesn't have to translate "if a slot
// canyon is on the plan" into "is one on TODAY's plan."
function getWeatherWarnings(day, w) {
  if (!w || w.outOfRange) return [];
  const out = [];
  const tmaxC = w.tmax != null ? (w.tmax - 32) * 5 / 9 : null;
  const tminC = w.tmin != null ? (w.tmin - 32) * 5 / 9 : null;
  const rainProb = w.precipProb || 0;
  const rainMm = w.precip || 0;
  const isStorm = w.code != null && w.code >= 95;
  const isWet = rainProb >= 30 || rainMm >= 1;

  // Helper: query stop hazards (from js/hazards.js).
  const stopsOf = (cat) => (typeof stopsWithHazard === 'function')
    ? stopsWithHazard(day, cat)
    : [];
  const namesList = (stops, max = 3) => {
    const names = stops.map(s => s.name);
    if (names.length <= max) return names.join(', ');
    return names.slice(0, max).join(', ') + ` +${names.length - max} more`;
  };

  // ── CRITICAL: slot canyon + any wet forecast = flash flood risk ─────────────
  if (isWet || isStorm) {
    const slots = stopsOf('slot-canyon');
    if (slots.length) {
      out.push({
        icon: '🚨', urgent: true,
        text: `CANCEL the slot canyons today: ${namesList(slots)}. Forecast ${rainProb}% rain. Flash floods are the deadliest risk in this region — water from rain hours away upstream can hit the slot with no warning.`
      });
    }
    const guided = stopsOf('guided-tour');
    if (guided.length && (rainProb >= 50 || isStorm)) {
      out.push({
        icon: '⚠️', urgent: true,
        text: `${namesList(guided)} is a slot canyon — your tour operator monitors weather and will reschedule if unsafe. Confirm with them before driving over: ${rainProb}% rain forecast.`
      });
    }
  }

  // ── CRITICAL: dirt-clay road + rain = stuck/impassable ──────────────────────
  if (isWet) {
    const roads = stopsOf('dirt-road-clay');
    if (roads.length) {
      out.push({
        icon: '🚨', urgent: true,
        text: `SKIP these stops today — clay dirt roads become impassable when wet (${rainProb}% rain): ${namesList(roads)}. Even a 4-by-4 gets stuck. Choose paved alternatives or move the day.`
      });
    }
  }

  // ── HIGH: thunderstorm + exposed rim/summit = lightning ─────────────────────
  if (isStorm) {
    const rims = stopsOf('exposed-rim');
    if (rims.length) {
      out.push({
        icon: '⛈️', urgent: true,
        text: `Thunderstorms forecast — get OFF exposed rock by midday at: ${namesList(rims)}. Lightning hits the highest point. Drop down into the canyon or the car.`
      });
    } else {
      out.push({
        icon: '⛈️', urgent: true,
        text: `Thunderstorms forecast. Exposed rock = lightning risk. Stay off open slickrock and rim viewpoints between 12:00 and 18:00 if you hear thunder.`
      });
    }
  }

  // ── HIGH: heat + strenuous hike = heat-stroke risk for 60+ ──────────────────
  if (tmaxC !== null && tmaxC >= 30) {
    const hikes = stopsOf('strenuous-hike');
    if (hikes.length) {
      out.push({
        icon: '🥵', urgent: true,
        text: `Hot day (${Math.round(tmaxC)}°C) + strenuous hikes: ${namesList(hikes)}. Start by 07:00 or skip. At 60+, heat-stroke signs (dry hot skin, no sweating, confusion) appear late. Drink every 20 minutes. If those signs appear — call 911 immediately.`
      });
    } else {
      out.push({
        icon: '🥵', urgent: true,
        text: `Extreme heat today (${Math.round(tmaxC)}°C). At 60+, heat-stroke signs appear late. Drink water every 20 minutes, wear a hat, rest in shade.`
      });
    }
  } else if (tmaxC !== null && tmaxC >= 26) {
    out.push({
      icon: '☀️', urgent: false,
      text: `Hot today (${Math.round(tmaxC)}°C). Drink every half hour even if you're not thirsty.`
    });
  }

  // ── INFO: cold morning ──────────────────────────────────────────────────────
  if (tminC !== null && tminC <= 5) {
    out.push({
      icon: '🥶', urgent: false,
      text: `Cold morning (${Math.round(tminC)}°C). Layers, gloves, hat — easy to peel off later.`
    });
  }

  // ── INFO: generic rain (no specific hazard match) ───────────────────────────
  // Only show if no other rain-driven warnings already fired for this day.
  const alreadyFlagged = out.some(p => p.urgent && (p.icon === '🚨' || p.icon === '⛈️'));
  if (isWet && !alreadyFlagged) {
    out.push({
      icon: '🌧️', urgent: false,
      text: `Rain expected (${rainProb}%, ${rainMm} mm). No high-risk activity on the day's plan, but bring rain layer and check road conditions before driving dirt sections.`
    });
  }

  return out;
}
