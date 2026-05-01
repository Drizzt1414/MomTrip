// Service worker for Mom's Canyon Trip PWA.
// Offline-first for app shell + per-request caching for OSM tiles so maps work on weak signal.

const APP_CACHE  = 'canyon-trip-app-v4';
const TILE_CACHE = 'canyon-trip-tiles-v1';
const TILE_CACHE_MAX = 400;

const APP_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './lib/leaflet.js',
  './lib/leaflet.css',
  './lib/leaflet-images/marker-icon.png',
  './lib/leaflet-images/marker-icon-2x.png',
  './lib/leaflet-images/marker-shadow.png',
  './lib/leaflet-images/layers.png',
  './lib/leaflet-images/layers-2x.png',
  './js/i18n.js',
  './js/data.js',
  './js/weather.js',
  './js/app.js',
  './js/render.js',
  './js/guide.js',
  './js/wizard.js',
  './assets/icon.svg',
  './assets/icon-maskable.svg',
  './assets/favicon.svg',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    // put() per-URL so one missing file doesn't abort the whole install.
    await Promise.all(APP_URLS.map(async u => {
      try {
        const resp = await fetch(u, { cache: 'reload' });
        if (resp.ok) await cache.put(u, resp.clone());
      } catch (_) {}
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== APP_CACHE && k !== TILE_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  for (const k of keys.slice(0, keys.length - max)) await cache.delete(k);
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // OSM map tiles: cache-first, background-update, LRU cap.
  if (/\.tile\.openstreetmap\.org$/.test(url.hostname)) {
    event.respondWith((async () => {
      const cache = await caches.open(TILE_CACHE);
      const cached = await cache.match(req);
      const net = fetch(req).then(r => {
        if (r && r.ok) { cache.put(req, r.clone()); trimCache(TILE_CACHE, TILE_CACHE_MAX); }
        return r;
      }).catch(() => null);
      return cached || (await net) || new Response('', { status: 504 });
    })());
    return;
  }

  // Same-origin: cache-first with network fallback and navigation recovery.
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const resp = await fetch(req);
        if (resp && resp.ok) {
          const clone = resp.clone();
          caches.open(APP_CACHE).then(c => c.put(req, clone));
        }
        return resp;
      } catch (_) {
        if (req.mode === 'navigate') {
          const shell = await caches.match('./index.html');
          if (shell) return shell;
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })());
  }
});
