-- ============================================
-- AURON — Push notifications migration
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- Safe to run once. Does not modify any existing table.
--
-- Before running: replace YOUR_PROJECT_REF and YOUR_WEBHOOK_SECRET
-- below with real values (see the setup instructions).
-- ============================================

-- 1. NOTIFICATIONS
-- Single source of truth. Inserting a row here is what creates a
-- notification — it can power an in-app list later, and (via the
-- trigger below) always triggers a push to the user's devices.
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  body text not null,
  url text default '/',            -- e.g. '/?tab=workout' — where a tap should open
  category text default 'general', -- 'workout_reminder' | 'scheduled_workout' | 'rest_day' |
                                    -- 'daily_motivation' | 'nutrition_reminder' |
                                    -- 'inactivity_reminder' | 'account' | 'general'
  read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Users manage own notifications" on notifications for all using (auth.uid() = user_id);

create index if not exists notifications_user_id_idx on notifications(user_id, created_at desc);


-- 2. PUSH SUBSCRIPTIONS
-- One row per browser/device. A user can have several.
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table push_subscriptions enable row level security;
create policy "Users manage own push subscriptions" on push_subscriptions for all using (auth.uid() = user_id);


-- 3. TRIGGER → send-push Edge Function
-- Requires the pg_net extension (enabled by default on Supabase projects).
create extension if not exists pg_net;

create or replace function trigger_send_push()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'YOUR_WEBHOOK_SECRET'
    ),
    body := jsonb_build_object(
      'user_id', new.user_id,
      'title', new.title,
      'body', new.body,
      'url', new.url
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_notification_created
  after insert on notifications
  for each row execute procedure trigger_send_push();

-- ============================================
-- DONE.
-- ============================================
