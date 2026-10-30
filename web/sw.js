/* Offline-first SW: network-first for code/HTML, cache-first for media */
const CACHE = 'rebirth-v13-1';
const ASSETS = [
  './index.html', './style6.css',
  './worlds6.js', './story6.js', './linefield6.js',
  './cost13.js', './priv12.js', './orch11.js', './web10.js', './ai9.js', './cards9.js', './uic9.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;
  const isCode = /\.(?:js|css|html)$/.test(new URL(req.url).pathname) || req.mode === 'navigate';
  if (isCode) {
    // network first: never serve stale game code while iterating
    e.respondWith(fetch(req, {cache:'no-store'}).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    return res;
  })));
});
