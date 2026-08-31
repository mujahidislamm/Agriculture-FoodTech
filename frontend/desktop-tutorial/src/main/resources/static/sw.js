/* ── FasalSathi Service Worker — Offline-First ──────────────────────── */

const CACHE_NAME = 'fasalsathi-v1';
const SHELL_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/i18n.js',
  '/manifest.json'
];

/* Cache app shell on install */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

/* Clean old caches on activate */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Network-first for API, cache-first for app shell */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Reference data (districts/crops): stale-while-revalidate so dropdowns work offline
  if (url.pathname === '/api/v1/districts' || url.pathname === '/api/v1/crops') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        fetch(event.request).then(res => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        }).catch(() => cache.match(event.request).then(c => c || new Response('[]', {
          status: 503, headers: { 'Content-Type': 'application/json' }
        })))
      )
    );
    return;
  }

  // API requests: network-first, no cache fallback (queued in IndexedDB by app.js)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ offline: true, message: 'You are offline. Request queued.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } })
      )
    );
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() =>
        new Response('Offline', { status: 503 })
      )
    )
  );
});
