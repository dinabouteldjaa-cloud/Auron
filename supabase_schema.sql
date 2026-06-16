-- ============================================
-- AURON FITNESS APP — SUPABASE DATABASE SCHEMA
-- Paste this entire file into:
-- Supabase Dashboard → SQL Editor → Run
-- ============================================

-- 1. PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  age int,
  weight_kg numeric,
  height_cm numeric,
  gender text,
  activity_level text,
  primary_goal text default 'General health',
  calorie_goal int default 2200,
  protein_goal int default 150,
  carbs_goal int default 250,
  fat_goal int default 73,
  water_goal int default 8,
  water_unit text default 'cups',
  water_goal_ml int default 2000,
  cup_size_ml int default 250,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- 2. FOOD LOGS
create table if not exists food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  meal_slot text not null check (meal_slot in ('breakfast','lunch','snack','dinner')),
  food_name text not null,
  calories int not null,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  notes text,
  created_at timestamptz default now()
);

alter table food_logs enable row level security;
create policy "Users manage own food logs" on food_logs for all using (auth.uid() = user_id);


-- 3. WATER LOGS
create table if not exists water_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  cups int default 0,
  amount_ml int default 0,
  updated_at timestamptz default now(),
  unique(user_id, log_date)
);

alter table water_logs enable row level security;
create policy "Users manage own water logs" on water_logs for all using (auth.uid() = user_id);


-- 4. DAILY STATS
create table if not exists daily_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  steps int,
  burned_kcal int,
  sleep_hours numeric,
  source text default 'manual',
  updated_at timestamptz default now(),
  unique(user_id, log_date)
);

alter table daily_stats enable row level security;
create policy "Users manage own daily stats" on daily_stats for all using (auth.uid() = user_id);


-- 5. WORKOUT LOGS
create table if not exists workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  workout_name text not null,
  workout_type text,
  duration_minutes int,
  calories_burned int,
  notes text,
  created_at timestamptz default now()
);

alter table workout_logs enable row level security;
create policy "Users manage own workout logs" on workout_logs for all using (auth.uid() = user_id);


-- 6. AI PLANS
create table if not exists ai_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan_type text not null check (plan_type in ('workout','nutrition','combined')),
  title text not null,
  content text not null,
  goal text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table ai_plans enable row level security;
create policy "Users manage own plans" on ai_plans for all using (auth.uid() = user_id);


-- 7. BODY MEASUREMENTS
create table if not exists body_measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  measured_at date not null default current_date,
  weight_kg numeric,
  body_fat_pct numeric,
  notes text,
  created_at timestamptz default now()
);

alter table body_measurements enable row level security;
create policy "Users manage own measurements" on body_measurements for all using (auth.uid() = user_id);


-- ============================================
-- DONE! Your database is ready.
-- ============================================
