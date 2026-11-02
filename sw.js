// Service Worker fuer Offline-Spielen. Alle Pfade relativ (laeuft auch unter /lumora/).
// Bei neuen Versionen die Zahl erhoehen, dann werden alte Caches geloescht.
const VERSION = 'v2';
const CORE = 'lumora-core-' + VERSION;
const IMAGES = 'lumora-img-' + VERSION;

let scripts = [];
try { importScripts('js/files.js'); scripts = [].concat(self.LUM_FILES.logic, self.LUM_FILES.ui); } catch (e) { /* ohne Liste */ }
const CORE_FILES = ['./', 'index.html', 'css/style.css', 'js/files.js', 'manifest.webmanifest', 'img/icons/icon-192.png'].concat(scripts);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CORE).then((c) => Promise.all(CORE_FILES.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CORE && k !== IMAGES).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.(png|jpe?g|webp|gif|svg|mp3|ogg|wav)$/i.test(url.pathname)) {
    // stale-while-revalidate: sofort aus dem Cache, im Hintergrund neu laden (ersetzte Bilder kommen beim naechsten Mal an)
    e.respondWith(caches.open(IMAGES).then((c) => c.match(req).then((hit) => {
      const fresh = fetch(req).then((res) => { if (res.ok) return c.put(req, res.clone()).then(() => res); return res; });
      if (hit) { e.waitUntil(fresh.catch(() => {})); return hit; }
      return fresh;
    })));
    return;
  }
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CORE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
});