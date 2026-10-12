// AIMST University Exam Proctoring - PWA Service Worker
// Offline Fallback Strategy:
// In compliance with academic integrity requirements, EXAM CONTENT IS NEVER CACHED OFFLINE.
// If connectivity is interrupted, users are presented with a friendly offline notice.

const CACHE_NAME = 'aimst-proctor-cache-v1';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Never intercept API calls, dynamic exam queries, or webcam streams with stale cache
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('/exam/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      // If network fails, serve offline fallback page for navigation requests
      if (event.request.mode === 'navigate') {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match(OFFLINE_URL);
        if (cachedOffline) return cachedOffline;
      }
      return caches.match(event.request);
    })
  );
});
