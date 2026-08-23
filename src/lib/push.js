// ─────────────────────────────────────────────────────────────
// Auron — Push notification service (Capacitor + Firebase Cloud
// Messaging). Only does anything on a real iOS/Android build;
// on web (Vercel) every function here is a safe no-op.
// ─────────────────────────────────────────────────────────────
import { Capacitor } from '@capacitor/core'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'
import { supabase } from './supabase'

// True only inside the native iOS/Android app shell — never true
// in a regular browser tab or installed PWA.
export function isNativePush() {
  return Capacitor.isNativePlatform()
}

function askedKey(userId) {
  return `auron_push_asked_${userId}`
}

// Save the token for this device, tied to the signed-in user.
// One row per (user, token) — a user can have several devices.
async function saveToken(userId, token) {
  const platform = Capacitor.getPlatform() // 'ios' | 'android'
  await supabase.from('push_tokens').upsert(
    { user_id: userId, token, platform, last_seen_at: new Date().toISOString() },
    { onConflict: 'user_id,token' }
  )
}

async function removeToken(userId, token) {
  if (!token) return
  await supabase.from('push_tokens').delete().eq('user_id', userId).eq('token', token)
}

async function savePermissionState(userId, state) {
  await supabase.from('notification_preferences').upsert(
    { user_id: userId, push_permission_state: state, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  )
}

// Call once, after login/onboarding — not on cold start. Checks the
// OS permission first: only shows the native prompt if the user has
// never been asked before, so a prior "Don't Allow" is never repeated.
export async function registerForPush(userId) {
  if (!userId || !isNativePush()) {
    return { state: 'unavailable' }
  }

  try {
    const { receive } = await FirebaseMessaging.checkPermissions()
    let state = receive // 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'

    if (state === 'prompt' || state === 'prompt-with-rationale') {
      const result = await FirebaseMessaging.requestPermissions()
      state = result.receive
    }

    localStorage.setItem(askedKey(userId), 'true')

    if (state === 'granted') {
      const { token } = await FirebaseMessaging.getToken()
      if (token) await saveToken(userId, token)
      await savePermissionState(userId, 'granted')
      return { state: 'granted', token }
    }

    await savePermissionState(userId, state === 'denied' ? 'denied' : 'unavailable')
    return { state }
  } catch (err) {
    console.error('Push registration failed:', err)
    return { state: 'unavailable', error: err }
  }
}

// Keep the stored token fresh (call on every app open once logged in —
// cheap, and re-syncs a refreshed token without re-prompting for permission).
export async function syncPushToken(userId) {
  if (!userId || !isNativePush()) return
  try {
    const { receive } = await FirebaseMessaging.checkPermissions()
    if (receive !== 'granted') return
    const { token } = await FirebaseMessaging.getToken()
    if (token) await saveToken(userId, token)
  } catch (err) {
    console.error('Push token sync failed:', err)
  }
}

export function hasAskedForPush(userId) {
  return !!userId && localStorage.getItem(askedKey(userId)) === 'true'
}

// Wire up listeners once at app startup. `onNotificationTap` receives
// the notification's `data` payload so the app can navigate to the
// right screen — works whether the app was open, backgrounded, or
// fully closed and launched by the tap itself.
export function initPushListeners({ onNotificationTap } = {}) {
  if (!isNativePush()) return () => {}

  const tapListener = FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
    const data = event?.notification?.data
    if (data && onNotificationTap) onNotificationTap(data)
  })

  // Foreground delivery — no action needed beyond letting the OS show
  // the banner (handled natively); kept for future in-app toast support.
  const receiveListener = FirebaseMessaging.addListener('notificationReceived', () => {})

  const tokenListener = FirebaseMessaging.addListener('tokenReceived', async (event) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id && event?.token) saveToken(user.id, event.token)
  })

  return () => {
    tapListener.then(h => h.remove())
    receiveListener.then(h => h.remove())
    tokenListener.then(h => h.remove())
  }
}

// Call on sign-out so a shared/reset device stops receiving this
// user's notifications.
export async function unregisterPush(userId) {
  if (!userId || !isNativePush()) return
  try {
    const { token } = await FirebaseMessaging.getToken()
    await removeToken(userId, token)
    await FirebaseMessaging.deleteToken()
  } catch {
    // best-effort — sign-out should never be blocked by this
  }
}
