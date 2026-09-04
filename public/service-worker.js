const CACHE_NAME = 'ic1101-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('⚠️ Some assets failed to cache:', err);
        // Continue even if some assets fail
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, but NEVER cache API responses
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // NEVER cache API calls (Gemini, Groq, PubMed, etc.)
  if (
    url.hostname.includes('generativelanguage.googleapis.com') ||
    url.hostname.includes('api.groq.com') ||
    url.hostname.includes('eutils.ncbi.nlm.nih.gov')
  ) {
    console.log('🌐 Service Worker: Passing through API call (no cache):', url.hostname);
    return event.respondWith(fetch(request));
  }

  // For everything else: try cache first, fall back to network
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        console.log('💾 Service Worker: Serving from cache:', request.url);
        return response;
      }

      return fetch(request).then((response) => {
        // Only cache successful responses
        if (response.status === 200 && request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch((error) => {
        console.warn('❌ Service Worker: Fetch failed:', error);
        // Return offline page or cached response
        return caches.match('/index.html');
      });
    })
  );
});
