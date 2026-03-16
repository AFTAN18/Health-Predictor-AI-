-- Run this SQL in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  age numeric not null,
  glucose numeric not null,
  blood_pressure numeric not null,
  cholesterol numeric not null default 0,
  "BMI" numeric not null,
  prediction int not null check (prediction in (0, 1)),
  probability numeric not null check (probability >= 0 and probability <= 1),
  future_probability numeric not null default 0 check (future_probability >= 0 and future_probability <= 1),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.predictions add column if not exists cholesterol numeric not null default 0;
alter table public.predictions add column if not exists future_probability numeric not null default 0;
alter table public.predictions alter column user_id drop not null;

create index if not exists idx_predictions_user_created_at on public.predictions (user_id, created_at desc);

alter table public.predictions enable row level security;

drop policy if exists "users_can_read_their_predictions" on public.predictions;
drop policy if exists "public_can_read_predictions" on public.predictions;
create policy "public_can_read_predictions"
on public.predictions
for select
using (true);

drop policy if exists "service_role_can_insert_predictions" on public.predictions;
create policy "service_role_can_insert_predictions"
on public.predictions
for insert
to service_role
with check (true);
