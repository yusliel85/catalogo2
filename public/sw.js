const CACHE_NAME = 'catalog-creator-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Only handle standard GET requests
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isSelf = url.origin === self.location.origin;
  const isFont = url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com');

  // Skip browser extensions or external APIs (except Google Fonts)
  if (!isSelf && !isFont) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // If we have a cached version, return it immediately and update in background
      if (cachedResponse) {
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // If not cached, fetch from network and cache it dynamically for next time
      return fetch(e.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Fallback for document navigation when completely offline
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw err;
      });
    })
  );
});
