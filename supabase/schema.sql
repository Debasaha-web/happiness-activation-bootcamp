-- ─────────────────────────────────────────────────────────────────────
--  Happiness Activation Bootcamp — Supabase schema (ABM 3.0)
--  Run this in the Supabase SQL editor on a NEW, isolated project.
--  Consumer product: each person owns their own data. No coach/admin layer.
-- ─────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── users ──
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text,
  created_at  timestamptz not null default now()
);

-- ── cohorts (optional; unused in solo self-paced v1, kept for later) ──
create table if not exists public.cohorts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  start_date  date
);

-- ── enrollments ──
create table if not exists public.enrollments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  cohort_id     uuid references public.cohorts(id),
  current_day   int  not null default 1,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  unique (user_id)
);

-- ── day_progress ──
create table if not exists public.day_progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  day              int  not null check (day between 1 and 7),
  am_complete      boolean not null default false,
  pm_complete      boolean not null default false,
  am_completed_at  timestamptz,
  pm_completed_at  timestamptz,
  unique (user_id, day)
);

-- ── responses (one row per answered prompt) ──
do $$ begin
  create type block_type as enum ('am', 'pm');
exception when duplicate_object then null; end $$;

do $$ begin
  create type exercise_type as enum (
    'neuro_tagging', 'ras', 'verbal_encoding', 'neuro_journaling', 'mindset_bursting'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type format_type as enum ('text', 'tf', 'dropdown', 'voice', 'burst');
exception when duplicate_object then null; end $$;

create table if not exists public.responses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  day            int  not null check (day between 1 and 7),
  block          block_type not null,
  exercise       exercise_type not null,
  prompt_key     text not null,            -- stable key, e.g. "d1_tag_see"
  format         format_type not null,
  value_text     text,
  value_bool     boolean,
  value_choice   text,
  audio_url      text,                     -- verbal encoding, if ever storing audio
  scenario_tied  boolean not null default false,
  created_at     timestamptz not null default now(),
  -- one stored answer per prompt per user; re-answering upserts in place
  unique (user_id, day, prompt_key)
);

create index if not exists responses_user_day_idx on public.responses (user_id, day);

-- ── reports (the Day-7 output) ──
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  generated_at  timestamptz not null default now(),
  summary_md    text,
  delivered     boolean not null default false,
  unique (user_id)
);

-- ─────────────────────────────────────────────────────────────────────
--  Row Level Security
--  All writes go through the server (service-role key) after we verify
--  the magic-link session JWT ourselves, so we lock the tables down and
--  let the service role bypass RLS. No anon client-side writes.
-- ─────────────────────────────────────────────────────────────────────
alter table public.users        enable row level security;
alter table public.enrollments  enable row level security;
alter table public.day_progress enable row level security;
alter table public.responses    enable row level security;
alter table public.reports      enable row level security;
alter table public.cohorts      enable row level security;
-- (No policies created on purpose: anon/public clients get no access.
--  The service-role key used server-side bypasses RLS entirely.)
