// supabase/functions/send-push/index.ts
//
// Called by the `on_notification_created` Postgres trigger every time a
// row is inserted into `notifications`. Sends a Web Push message to
// every device the user has subscribed on.
//
// Deploy with:  supabase functions deploy send-push --no-verify-jwt
// (no-verify-jwt because this is called by pg_net with our own shared
// secret, not a logged-in user's Supabase JWT)

import webpush from 'npm:web-push@3.6.7'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const WEBHOOK_SECRET    = Deno.env.get('WEBHOOK_SECRET')!
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically
// by the Edge Functions runtime — no need to set these yourself.
const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

webpush.setVapidDetails('mailto:support@auronapp.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { user_id, title, body, url } = await req.json()
  if (!user_id || !title) {
    return new Response('Missing user_id or title', { status: 400 })
  }

  const subsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?user_id=eq.${user_id}`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  )
  const subs = await subsRes.json()

  await Promise.all(subs.map(async (sub: any) => {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }
    try {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body, url: url || '/' }))
    } catch (err: any) {
      // 404/410 = subscription is gone (uninstalled, expired, etc.) — clean it up
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?id=eq.${sub.id}`, {
          method: 'DELETE',
          headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
        })
      } else {
        console.error('Push send failed for subscription', sub.id, err)
      }
    }
  }))

  return new Response('ok')
})
