const CACHE = 'wwpm-v66';
const ASSETS = [
  '/wwpm-mobile/',
  '/wwpm-mobile/index.html',
  '/wwpm-mobile/app.js',
  '/wwpm-mobile/style.css',
  '/wwpm-mobile/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(
        ASSETS.map(url =>
          fetch(new Request(url, { cache: 'reload' }))
            .then(r => { if (r.ok) return c.put(url, r); })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  const isOwn = e.request.url.includes('leonkolop1-rgb.github.io');
  const req = isOwn ? new Request(e.request.url, { cache: 'no-cache' }) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      if (r.ok && isOwn) {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
