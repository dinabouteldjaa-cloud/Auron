import { useEffect } from 'react'
import { registerForPush, syncPushToken, hasAskedForPush, isNativePush } from '../lib/push'

// Prompts for push permission once, at an appropriate moment: only
// after the user is logged in AND has already been through (or
// dismissed) onboarding. On every later app open it just quietly
// refreshes the stored token — it never re-shows the OS prompt.
export function usePushRegistration(userId, onboardingSeen) {
  useEffect(() => {
    if (!userId || !isNativePush()) return

    if (!onboardingSeen) return

    if (hasAskedForPush(userId)) {
      syncPushToken(userId)
    } else {
      registerForPush(userId)
    }
  }, [userId, onboardingSeen])
}
