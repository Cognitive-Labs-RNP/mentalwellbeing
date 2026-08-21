-- =============================================================================
-- 002_phase5_tools_schema.sql
-- Mental Wellbeing App — Phase 5 Global Tools Database Schema
--
-- Reuses existing tool_records and tool_usage from 001_initial_schema.sql.
-- Adds health_records for BMI/metrics and a completed flag on tool_records
-- so Phase 6 can reconstruct Journal & Journey without duplicating tables.
-- =============================================================================

-- =============================================================================
-- TABLE: health_records
-- Stores general health tracking metrics (height, weight, age, activity, BMI).
-- =============================================================================

create table if not exists public.health_records (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users (id) on delete cascade,
  height_cm      numeric     not null check (height_cm > 0),
  weight_kg      numeric     not null check (weight_kg > 0),
  age            integer     check (age > 0 and age < 130),
  activity_level text,
  bmi            numeric     not null,
  bmi_category   text        not null,
  created_at     timestamptz not null default now()
);

comment on table  public.health_records              is 'Stores general health metrics and BMI calculations per user.';
comment on column public.health_records.bmi_category is 'General non-clinical BMI category (Underweight, Healthy Weight, Overweight, Obese).';

create index if not exists health_records_user_id_idx on public.health_records (user_id);
create index if not exists health_records_created_idx on public.health_records (created_at desc);

alter table public.health_records enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'health_records' and policyname = 'Users can manage their own health records'
  ) then
    create policy "Users can manage their own health records"
      on public.health_records
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- =============================================================================
-- tool_records: Phase 6 helper column (user/tool/value/timestamp already exist)
-- =============================================================================

alter table public.tool_records
  add column if not exists completed boolean;

comment on column public.tool_records.completed is
  'Completion status for the tool session or saved entry. Null for legacy rows.';

create index if not exists tool_records_completed_idx
  on public.tool_records (user_id, completed, created_at desc);

-- Allow authenticated users to edit their own historical rows if they later
-- choose a specific record. Inserts remain append-only from the app.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'tool_records'
      and policyname = 'tool_records: users update own rows'
  ) then
    create policy "tool_records: users update own rows"
      on public.tool_records
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
