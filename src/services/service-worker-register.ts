/**
 * Service Worker Registration
 * Registers the service worker for PWA functionality
 */

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser')
    return
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/sw.js',
      { scope: '/' }
    )
    console.log('Service Worker registered successfully:', registration)
  } catch (error) {
    console.error('Service Worker registration failed:', error)
  }
}

export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
    }
    console.log('Service Worker unregistered successfully')
  } catch (error) {
    console.error('Service Worker unregistration failed:', error)
  }
}
