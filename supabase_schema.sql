-- ============================================
-- AURON FITNESS APP — SUPABASE DATABASE SCHEMA
-- Paste this entire file into:
-- Supabase Dashboard → SQL Editor → Run
-- ============================================

-- 1. PROFILES
-- Stores each user's personal info and goals
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
  updated_at timestamptz default now()
);

-- Enable row-level security so users only see their own data
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create a profile when a new user signs up
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
-- Stores every food item a user logs, per meal, per day
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
-- Tracks daily water intake (number of cups)
create table if not exists water_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  log_date date not null default current_date,
  cups int default 0,
  updated_at timestamptz default now(),
  unique(user_id, log_date)
);

alter table water_logs enable row level security;
create policy "Users manage own water logs" on water_logs for all using (auth.uid() = user_id);


-- 4. WORKOUT LOGS
-- Records completed workouts
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


-- 5. AI PLANS
-- Saves AI-generated workout and nutrition plans
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


-- 6. BODY MEASUREMENTS
-- Tracks weight, body fat, etc over time
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
