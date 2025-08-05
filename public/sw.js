/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// Service Worker for caching and performance optimization
const CACHE_NAME = 'replivity-v1';
const STATIC_CACHE_NAME = 'replivity-static-v1';
const DYNAMIC_CACHE_NAME = 'replivity-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/css/',
  '/_next/static/js/',
];

// Assets to cache on first request
const CACHE_STRATEGIES = {
  // Cache first, then network
  CACHE_FIRST: 'cache-first',
  // Network first, then cache
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Determine caching strategy based on request type
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request));
  } else if (isPageRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Helper functions to determine request types
/**
 * Determines if a given request URL is for a static asset.
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/static/') ||
    (/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/.exec(url.pathname))
  );
}

/**
 * Determines if a request is an API request based on its URL path.
 */
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/trpc/');
}

/**
 * Checks if the given request is a page request by verifying if it accepts HTML.
 */
function isPageRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Caching strategies
/**
 * Implements a cache-first strategy to fetch a resource.
 *
 * This function attempts to retrieve a cached response first. If a cached response is available, it returns that response.
 * If no cached response is found, it fetches the resource from the network. If the network request is successful,
 * it caches the response for future use and returns the network response. If any step fails, it logs an error
 * and returns a offline response with a 503 status.
 *
 * @param {Request} request - The request object to be fetched.
 * @returns {Promise<Response>} - A Promise that resolves to the response from cache or network.
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Fetches a resource from the network and caches it for future use.
 *
 * First, it attempts to fetch the resource using the provided request.
 * If successful, it stores the response in the cache under `DYNAMIC_CACHE_NAME`.
 * If the network request fails, it retrieves the resource from the cache.
 * If neither the network nor the cache provides a valid response, it returns an offline response.
 *
 * @param {Request} request - The request object for the resource to be fetched.
 * @returns {Promise<Response>} A promise that resolves to the response from the network or cache.
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Implements a stale-while-revalidate caching strategy for network requests.
 *
 * This function first attempts to retrieve a response from the cache for the given request.
 * If a cached response is found, it returns that response immediately while simultaneously making a network request in the background.
 * The network response is then stored in the cache if it is successful, ensuring future requests can use the updated data.
 *
 * @param {Request} request - The network request to be made and cached.
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse ?? fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Triggers a background sync operation.
 */
// eslint-disable-next-line @typescript-eslint/require-await
async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey ?? 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View',
          icon: '/icon-view.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-close.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Cleanup old caches periodically
setInterval(() => {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      if (cacheName.includes('old') || cacheName.includes('temp')) {
        caches.delete(cacheName);
      }
    });
  });
}, 24 * 60 * 60 * 1000); // 24 hours