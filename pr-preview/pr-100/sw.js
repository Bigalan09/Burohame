/* ===== Burohame Service Worker ===== */
'use strict';

const CACHE_NAME = 'burohame-__CACHE_VERSION__';

// Derive asset URLs from the SW registration scope so the worker
// is portable across any deployment path (e.g. GitHub Pages sub-path).
function scopeUrl(path = '') {
  return new URL(path, self.registration.scope).toString();
}

function shellAssetUrls() {
  return [
    scopeUrl(''),
    scopeUrl('index.html'),
    scopeUrl('config.js'),
    scopeUrl('leaderboard-handles.js'),
    scopeUrl('app.js'),
    scopeUrl('styles.css'),
  ];
}

function staticAssetUrls() {
  return [
    scopeUrl('manifest.json'),
    scopeUrl('icon-192.png'),
    scopeUrl('icon-512.png'),
  ];
}

const SHELL_ASSET_URLS = new Set(shellAssetUrls());
const STATIC_ASSET_URLS = new Set(staticAssetUrls());

function assetUrls() {
  return [...SHELL_ASSET_URLS, ...STATIC_ASSET_URLS];
}

function shellFallbackUrls() {
  return [scopeUrl(''), scopeUrl('index.html')];
}

function isShellRequest(request) {
  if (request.mode === 'navigate') return true;
  return SHELL_ASSET_URLS.has(request.url);
}

function isStaticAssetRequest(request) {
  return STATIC_ASSET_URLS.has(request.url);
}

async function cacheShellResponse(cache, request, response) {
  if (!response || response.status !== 200) return response;
  const cacheKey = request.mode === 'navigate' ? scopeUrl('') : request.url;
  await cache.put(cacheKey, response.clone());
  return response;
}

async function networkFirstShell(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    return cacheShellResponse(cache, request, response);
  } catch (_) {
    if (request.mode === 'navigate') {
      for (const fallbackUrl of shellFallbackUrls()) {
        const cached = await cache.match(fallbackUrl);
        if (cached) return cached;
      }
    }

    const cached = await cache.match(request.url);
    if (cached) return cached;
    throw _;
  }
}

async function cacheFirstStatic(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request.url);

  if (cached) {
    event.waitUntil(
      fetch(request).then(response => {
        if (response && response.status === 200) {
          return cache.put(request.url, response.clone());
        }
        return undefined;
      }).catch(() => undefined)
    );
    return cached;
  }

  const response = await fetch(request);
  if (response && response.status === 200) {
    await cache.put(request.url, response.clone());
  }
  return response;
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

  // The app shell should prefer the network so deploys show up immediately,
  // but still fall back to cache offline.
  if (isShellRequest(event.request)) {
    event.respondWith(networkFirstShell(event.request));
    return;
  }

  // Keep a small offline cache for static assets that do not affect app boot.
  if (isStaticAssetRequest(event.request)) {
    event.respondWith(cacheFirstStatic(event.request, event));
  }
});
