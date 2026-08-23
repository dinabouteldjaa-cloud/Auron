-- ============================================
-- AURON — Push notifications migration
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- Safe to run once. Does not modify any existing table.
-- ============================================

-- 8. PUSH TOKENS
-- One row per device. A user can have several (phone, tablet, etc.)
create table if not exists push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  token text not null,
  platform text not null check (platform in ('ios','android')),
  created_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  unique(user_id, token)
);

alter table push_tokens enable row level security;
create policy "Users manage own push tokens" on push_tokens for all using (auth.uid() = user_id);

-- Server-side sending (Edge Function) uses the service role key, which
-- bypasses RLS entirely — no extra policy needed for that.


-- 9. NOTIFICATION PREFERENCES
-- One row per user. Booleans default to on; push_permission_state tracks
-- what the OS last reported, so the app never re-prompts after a denial.
create table if not exists notification_preferences (
  user_id uuid references auth.users on delete cascade primary key,
  workout_reminder boolean default true,
  scheduled_workout boolean default true,
  rest_day boolean default true,
  daily_motivation boolean default true,
  nutrition_reminder boolean default true,
  inactivity_reminder boolean default true,
  push_permission_state text default 'not_requested'
    check (push_permission_state in ('not_requested','granted','denied','unavailable')),
  updated_at timestamptz default now()
);

alter table notification_preferences enable row level security;
create policy "Users manage own notification preferences" on notification_preferences for all using (auth.uid() = user_id);

-- ============================================
-- DONE.
-- ============================================
