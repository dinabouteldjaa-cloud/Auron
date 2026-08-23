// ─────────────────────────────────────────────────────────────
// Auron — Web Push subscription helper (VAPID).
// Same architecture as QPC: Notification + Service Worker + PushManager,
// subscription rows in Supabase `push_subscriptions`.
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export function isPushSupported() {
  return typeof window !== 'undefined' &&
    'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

// 'granted' | 'denied' | 'default' | 'unavailable'
export function pushPermissionState() {
  if (!isPushSupported()) return 'unavailable'
  return Notification.permission
}

function askedKey(userId) {
  return `auron_push_asked_${userId}`
}
export function hasAskedForPush(userId) {
  return !!userId && localStorage.getItem(askedKey(userId)) === 'true'
}

export async function hasExistingSubscription() {
  if (!isPushSupported()) return false
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  return !!subscription
}

// Requests permission (only shows the OS prompt if not already decided),
// registers the service worker, subscribes via PushManager, and stores
// the subscription. Safe to call repeatedly — it's a no-op if already
// subscribed and permission is still granted.
export async function subscribeToPush(userId) {
  if (!userId || !isPushSupported()) return { state: 'unavailable' }

  localStorage.setItem(askedKey(userId), 'true')

  let permission = Notification.permission
  if (permission === 'default') {
    permission = await Notification.requestPermission()
  }
  if (permission !== 'granted') return { state: permission }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
    }

    const json = subscription.toJSON()
    await supabase.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
      { onConflict: 'user_id,endpoint' }
    )

    return { state: 'granted' }
  } catch (err) {
    console.error('Push subscription failed:', err)
    return { state: 'unavailable', error: err }
  }
}

export async function unsubscribeFromPush(userId) {
  if (!userId || !isPushSupported()) return
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    if (subscription) {
      await supabase.from('push_subscriptions')
        .delete().eq('user_id', userId).eq('endpoint', subscription.endpoint)
      await subscription.unsubscribe()
    }
  } catch (err) {
    console.error('Push unsubscribe failed:', err)
  }
}
