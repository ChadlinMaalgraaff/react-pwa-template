# PWA Setup Guide

Comprehensive guide for Progressive Web App (PWA) features in the FTD Frontend application.

## Table of Contents

1. [What is a PWA?](#what-is-a-pwa)
2. [PWA Features](#pwa-features)
3. [Installation](#installation)
4. [Service Worker](#service-worker)
5. [Web App Manifest](#web-app-manifest)
6. [Testing PWA](#testing-pwa)
7. [Offline Support](#offline-support)
8. [Caching Strategies](#caching-strategies)

## What is a PWA?

A Progressive Web App (PWA) is a web application that uses modern web technologies to deliver app-like experiences to users. It works offline, loads quickly, and can be installed on the home screen.

### PWA Checklist

- ✅ HTTPS required (except localhost)
- ✅ Service Worker registered
- ✅ Web App Manifest included
- ✅ Responsive design
- ✅ Icon for home screen
- ✅ Splash screen
- ✅ Installable prompt

## PWA Features

### Core Features

1. **Offline Support**: Works without internet connection
2. **Installable**: Add to home screen like native app
3. **Fast**: Cached assets load instantly
4. **Reliable**: Quick load times even on poor connections
5. **Engaging**: Full-screen experience, notification support

### Benefits

- 📱 Install on home screen
- 🚀 Faster load times
- 🔌 Offline functionality
- 🔔 Push notifications
- 📈 Better engagement metrics

## Installation

### 1. Browser Installation

**Android Chrome:**
1. Open app in Chrome
2. Tap menu (⋮)
3. Tap "Install app"
4. Confirm installation

**iPhone Safari:**
1. Open app in Safari
2. Tap Share icon
3. Tap "Add to Home Screen"
4. Tap "Add"

**Desktop (Chromium):**
1. Open app in Chrome/Edge
2. Click install icon (top right)
3. Confirm installation

### 2. Programmatic Installation

```typescript
// src/components/InstallPrompt.tsx
import React from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = React.useState(false)

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      console.log('User installed app')
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg mb-4">
      <p>Install this app on your device for quick access</p>
      <button
        onClick={handleInstall}
        className="mt-2 px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100"
      >
        Install
      </button>
    </div>
  )
}

export default InstallPrompt
```

## Service Worker

### How Service Workers Work

```
User Request
    ↓
Service Worker
    ├→ Serve from Cache (cached response available)
    └→ Fetch from Network (if not cached or network request)
    ↓
Response to User
```

### Service Worker Lifecycle

```
1. Registration
   ↓
2. Installation (download + activate)
   ↓
3. Activation (cleanup old caches)
   ↓
4. Active (intercept requests)
   ↓
5. Terminated (when not needed)
```

### Updating Service Worker

```typescript
// src/services/service-worker-register.ts
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')

    // Check for updates periodically
    setInterval(() => {
      registration.update()
    }, 60000) // Every minute

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available - notify user
            dispatch(setNotification({
              message: 'App update available. Refresh to get the latest version.',
              type: 'info'
            }))
          }
        })
      }
    })
  } catch (error) {
    console.error('Service Worker registration failed:', error)
  }
}
```

### Skip Waiting for Updates

```typescript
// Force new service worker to activate immediately
export const skipWaiting = () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
  }
}

// In service-worker.js
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
```

## Web App Manifest

The manifest file defines app metadata and appearance.

### Manifest Configuration

`public/manifest.json`:

```json
{
  "name": "FTD Frontend Application",
  "short_name": "FTD App",
  "description": "Modern React Progressive Web Application",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3B82F6",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/logo-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/logo-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/logo-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["productivity"],
  "screenshots": [
    {
      "src": "/screenshot-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### Icon Requirements

| Purpose | Size | Format | Usage |
|---------|------|--------|-------|
| App icon | 192x192 | PNG | Standard home screen |
| Large icon | 512x512 | PNG | Splash screen |
| Maskable | 192x192 | PNG | Adaptive icon (Android 8+) |
| Favicon | 16x16, 32x32, 64x64 | ICO | Browser tabs |

### Icon Generation Tools

```bash
# Using ImageMagick
convert original.png -resize 192x192 logo-192.png
convert original.png -resize 512x512 logo-512.png

# Using online tools
# https://www.favicon-generator.org/
# https://www.pwa-asset-generator.netlify.app/
```

### Splash Screen

Configure splash screen appearance:

```html
<!-- index.html -->
<meta name="theme-color" content="#3B82F6" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="FTD App" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## Testing PWA

### Chrome DevTools PWA Checklist

1. Open Chrome DevTools (`F12`)
2. Go to **Lighthouse** tab
3. Select "Progressive Web App"
4. Click "Analyze page load"

### Manual PWA Testing

```bash
# Test on HTTPS (required for production)
# Use ngrok for local HTTPS testing
ngrok http 3000

# Or use localhost for development
http://localhost:3000
```

### DevTools Application Tab

1. **Manifest**: Check manifest.json validity
2. **Service Worker**: Monitor registration and updates
3. **Cache Storage**: View cached assets
4. **Offline**: Simulate offline mode

### Lighthouse Audit

Run Lighthouse audit:

```bash
# Using Lighthouse CLI
npm install -g lighthouse

# Audit local app
lighthouse http://localhost:3000 --view

# Expected scores:
# Performance: 90+
# PWA: 90+
```

### PWA Checklist

- [ ] HTTPS enabled (production)
- [ ] Service Worker registered
- [ ] Web App Manifest valid
- [ ] Icons present and correct sizes
- [ ] Responsive design
- [ ] Offline fallback page
- [ ] Start URL responsive
- [ ] Splash screen configured
- [ ] Installation prompt working
- [ ] No console errors

## Offline Support

### Offline Page

Create offline fallback page:

```typescript
// public/offline.html
<!DOCTYPE html>
<html>
<head>
  <title>Offline</title>
  <style>
    body {
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're Offline</h1>
    <p>Check your internet connection and try again.</p>
  </div>
</body>
</html>
```

### Service Worker Offline Strategy

```typescript
// public/sw.ts
self.addEventListener('fetch', (event: FetchEvent) => {
  // Serve offline page for document requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html') || new Response('Offline')
      })
    )
    return
  }

  // Network-first for API calls
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        return caches.match(event.request) || new Response('Offline')
      })
  )
})
```

### Detect Offline

```typescript
// src/hooks/useOnline.ts
export const useOnline = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' && navigator.onLine
  )

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Usage
function App() {
  const isOnline = useOnline()

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 p-4 mb-4">
          You are offline. Some features may be limited.
        </div>
      )}
    </div>
  )
}
```

## Caching Strategies

### Cache-First Strategy

Good for: Static assets, images, fonts

```typescript
// Always serve from cache, fetch if not available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

### Network-First Strategy

Good for: API calls, frequently updated content

```typescript
// Try network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone())
        })
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
```

### Stale-While-Revalidate

Good for: Images, non-critical data

```typescript
// Serve from cache immediately, update in background
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((response) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone())
        })
        return response
      })

      return cachedResponse || fetchPromise
    })
  )
})
```

## Background Sync

Register background sync tasks:

```typescript
// src/services/background-sync.ts
export const registerBackgroundSync = async (tag: string) => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready
    await (registration as any).sync.register(tag)
  }
}

// In service worker
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

const syncData = async () => {
  // Sync pending changes with server
  try {
    await apiClient.post('/sync', { /* data */ })
  } catch (error) {
    throw error // Retry sync
  }
}
```

## Push Notifications

Request notification permission:

```typescript
// src/services/notifications.ts
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported')
    return
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export const sendNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options)
    })
  }
}
```

## Troubleshooting

### Service Worker Not Updating

```typescript
// Force update
navigator.serviceWorker.ready.then((registration) => {
  registration.update()
})

// Clear cache manually
caches.keys().then((cacheNames) => {
  cacheNames.forEach((cacheName) => {
    caches.delete(cacheName)
  })
})
```

### PWA Not Installable

Check in DevTools:
1. HTTPS enabled (except localhost)
2. Valid manifest.json
3. Service Worker registered
4. Icons present
5. No errors in console

### Icons Not Showing

Verify in DevTools → Application → Manifest:
- Icon paths are correct
- File format is PNG
- Sizes match manifest declaration
- Icons are accessible

## Resources

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Guide](https://web.dev/progressive-web-apps/)
- [PWA Checklist](https://web.dev/install-criteria/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

## Summary

✅ PWA enables installation on home screen
✅ Service Worker provides offline support
✅ Web App Manifest defines app metadata
✅ Caching strategies optimize performance
✅ Background sync handles offline data
✅ Push notifications engage users

For questions about PWA features, refer to the web.dev PWA guide or contact the team.
