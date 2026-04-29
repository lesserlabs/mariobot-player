const CACHE_NAME = 'mariobot-player-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/stream-player.html',
  '/manifest.json',
  '/assets/mario/icon-192.png',
  '/assets/mario/icon-512.png',
  '/assets/mario/icon-192.svg',
  '/assets/mario/icon-512.svg'
];

// Install event - cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // For playlist.json and music tracks, always use network
  if (event.request.url.includes('/playlist.json') || 
      event.request.url.includes('/tracks/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // For HTML, CSS, JS, icons - use cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache the response for future use
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request.url, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // If offline and not in cache, show offline fallback
      if (event.request.headers.get('accept').includes('text/html')) {
        return caches.match('/stream-player.html');
      }
    })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});