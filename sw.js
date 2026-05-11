const CACHE = 'wwpm-v53';
const ASSETS = [
  '/wwpm-mobile/',
  '/wwpm-mobile/index.html',
  '/wwpm-mobile/app.js',
  '/wwpm-mobile/style.css',
  '/wwpm-mobile/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  // Do NOT call skipWaiting() here — wait for user to click "עדכן עכשיו"
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Allow the app to trigger skipWaiting via postMessage
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
