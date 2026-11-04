-- AgriPredict database schema.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- Safe to re-run.

-- ── User profiles (one row per signed-up user) ────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  state text not null default '',
  district text not null default '',
  role text not null default 'Farmer',
  avatar text not null default '🌾',
  portfolio text[] not null default array['rice', 'wheat', 'tomato', 'mustard'],
  farm_profile jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can only see and change their own profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── Web push subscriptions (server-only) ──────────────────────────────────────
-- Row level security is on with no policies, so only the server (secret key) can access it.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  keys jsonb not null,
  expiration_time bigint,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
