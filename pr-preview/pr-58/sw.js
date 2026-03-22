/* ===== Burohame Service Worker ===== */
'use strict';

const CACHE_NAME = 'burohame-v2';

// Derive asset URLs from the SW registration scope so the worker
// is portable across any deployment path (e.g. GitHub Pages sub-path).
function assetUrls() {
  const base = self.registration.scope;
  return [
    base,
    base + 'index.html',
    base + 'app.js',
    base + 'styles.css',
    base + 'manifest.json',
    base + 'icon-192.png',
    base + 'icon-512.png',
  ];
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(assetUrls().map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin resources
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Stale-while-revalidate: respond immediately from cache (fast load),
  // but also fetch from network and update cache in the background.
  // This ensures users see new deployments on their next visit after
  // the first one following a deployment.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) {
          // Serve from cache; revalidate in the background (fire-and-forget)
          event.waitUntil(
            fetch(event.request).then(response => {
              if (response && response.status === 200) {
                cache.put(event.request, response.clone());
              }
            }).catch(() => { /* network unavailable – keep existing cache */ })
          );
          return cached;
        }
        // Cache miss: fetch from network, cache on success, and serve
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    )
  );
});
