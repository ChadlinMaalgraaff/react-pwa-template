// Service Worker for PWA functionality
// Handles caching strategies and offline support

const APP_SHELL_CACHE = 'pantrypal-app-shell-v1'
const RUNTIME_CACHE = 'pantrypal-runtime-v1'

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/index.css',
]

// Reference data that changes slowly - safe to serve stale-while-revalidate.
const RUNTIME_CACHE_PATTERNS = [
  /^\/ingredients(\/.*)?$/,
  /^\/retailers(\/.*)?$/,
  /^\/recipes$/,
  /^\/recipes\?.*/,
  /^\/recipes\/[^/]+$/,
]

const isRuntimeCacheable = (pathname, search) => {
  const pathWithQuery = `${pathname}${search}`
  return RUNTIME_CACHE_PATTERNS.some((pattern) => pattern.test(pathWithQuery) || pattern.test(pathname))
}

// Install event - cache app shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== APP_SHELL_CACHE && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Stale-while-revalidate: serve from cache immediately, then refresh in the background.
const staleWhileRevalidate = (request) => {
  return caches.open(RUNTIME_CACHE).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        })
        .catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  })
}

// Cache-first with network fallback, for the precached app shell.
const cacheFirst = (request) => {
  return caches.match(request).then((response) => {
    if (response) {
      return response
    }

    return fetch(request).then((networkResponse) => {
      if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
        return networkResponse
      }

      const responseToCache = networkResponse.clone()
      caches.open(APP_SHELL_CACHE).then((cache) => {
        cache.put(request, responseToCache)
      })

      return networkResponse
    })
  })
}

// Fetch event - route between caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests - mutations must always hit the network.
  if (request.method !== 'GET') {
    return
  }

  // Reference data (ingredients, retailers, recipes) - stale-while-revalidate.
  if (isRuntimeCacheable(url.pathname, url.search)) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Live/mutable data (pantry, recipe matching, shopping lists) - always network.
  if (
    url.pathname.startsWith('/pantry') ||
    url.pathname.startsWith('/recipes/match') ||
    url.pathname.startsWith('/shopping-lists')
  ) {
    return
  }

  // App shell - cache first.
  event.respondWith(cacheFirst(request))
})

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
