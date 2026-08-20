-- =============================================================================
-- 001_initial_schema.sql
-- Mental Wellbeing App — initial database schema
--
-- Safe to run on a brand-new Supabase project.
-- Does NOT contain any secrets, keys or passwords.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------

-- pgcrypto gives us gen_random_uuid() on older Postgres versions.
-- On Supabase (Postgres 15+) uuid_generate_v4() or gen_random_uuid() work
-- natively, but enabling the extension is harmless.
create extension if not exists "pgcrypto";


-- =============================================================================
-- TABLE: profiles
-- Basic non-sensitive application profile linked to auth.users.
-- Stores the user-visible anonymous UID (WB-XXXXXX format).
-- Does NOT store email, phone, name or any PII.
-- =============================================================================

create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  -- FK to Supabase's built-in auth.users table
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  -- Human-readable anonymous identifier shown in the UI (e.g. WB-A3F9K2)
  uid         text not null unique,
  created_at  timestamptz not null default now()
);

comment on table  public.profiles                is 'One row per authenticated user. Stores only the anonymous UID visible to the user.';
comment on column public.profiles.user_id        is 'References auth.users.id — the Supabase Auth identity.';
comment on column public.profiles.uid            is 'User-visible anonymous identifier in WB-XXXXXX format.';

create index if not exists profiles_user_id_idx on public.profiles (user_id);
create index if not exists profiles_uid_idx     on public.profiles (uid);


-- =============================================================================
-- TABLE: analyses
-- Persisted analysis results (condition pattern matches).
-- Raw user text is NEVER stored here — only the processed structured summary.
-- =============================================================================

create table if not exists public.analyses (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users (id) on delete cascade,
  condition         text        not null,
  similarity_score  integer     not null check (similarity_score between 0 and 100),
  -- Processed/sanitised summary object — never contains raw user input
  structured_summary jsonb      not null default '{}',
  created_at        timestamptz not null default now()
);

comment on table  public.analyses                    is 'Stores processed analysis results. Raw user paragraphs are never persisted.';
comment on column public.analyses.structured_summary is 'JSONB containing mood/stress/energy scores and context tags only — no raw text.';

create index if not exists analyses_user_id_idx     on public.analyses (user_id);
create index if not exists analyses_user_cond_idx   on public.analyses (user_id, condition);
create index if not exists analyses_created_at_idx  on public.analyses (created_at desc);


-- =============================================================================
-- TABLE: condition_progress
-- Tracks which conditions have been detected for a user across sessions,
-- allowing condition workspaces to be reopened on next login.
-- =============================================================================

create table if not exists public.condition_progress (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users (id) on delete cascade,
  condition        text        not null,
  first_detected_at timestamptz not null default now(),
  last_used_at     timestamptz not null default now(),
  is_active        boolean     not null default true,
  -- Enforce one row per user+condition combination
  unique (user_id, condition)
);

comment on table public.condition_progress is 'Persists detected conditions per user so workspaces survive logout/login.';

create index if not exists condition_progress_user_id_idx on public.condition_progress (user_id);
create index if not exists condition_progress_active_idx  on public.condition_progress (user_id, is_active);


-- =============================================================================
-- TABLE: activity_logs
-- Records individual activity attempts/completions within a condition workspace.
-- =============================================================================

create table if not exists public.activity_logs (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users (id) on delete cascade,
  condition     text        not null,
  activity_id   text        not null,
  activity_name text        not null,
  completed     boolean     not null default false,
  -- Duration in minutes; null if not yet completed
  duration      integer,
  created_at    timestamptz not null default now()
);

comment on table public.activity_logs is 'Log of condition-specific activity attempts and completions.';

create index if not exists activity_logs_user_id_idx   on public.activity_logs (user_id);
create index if not exists activity_logs_condition_idx on public.activity_logs (user_id, condition);
create index if not exists activity_logs_created_idx   on public.activity_logs (created_at desc);


-- =============================================================================
-- TABLE: tool_usage
-- Records when global tools (mood check, sleep, lifestyle, etc.) are used.
-- =============================================================================

create table if not exists public.tool_usage (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  tool_name  text        not null,
  -- Optional: which condition context the tool was used from (nullable)
  condition  text,
  created_at timestamptz not null default now()
);

comment on table public.tool_usage is 'Records each time a global tool is opened/used.';

create index if not exists tool_usage_user_id_idx  on public.tool_usage (user_id);
create index if not exists tool_usage_tool_idx     on public.tool_usage (user_id, tool_name);
create index if not exists tool_usage_created_idx  on public.tool_usage (created_at desc);


-- =============================================================================
-- TABLE: tool_records
-- Stores numerical/structured measurements from tools.
-- Flexible JSONB metadata field covers all tool types.
-- =============================================================================

create table if not exists public.tool_records (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  tool_name  text        not null,
  value      numeric,
  unit       text,
  -- Flexible store: sleep hours, caffeine cups, mood score, weight, etc.
  metadata   jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

comment on table  public.tool_records          is 'Numerical measurements and structured data from all tool types.';
comment on column public.tool_records.metadata is 'Flexible JSONB for tool-specific fields (e.g. sleep quality, awakenings, water intake).';

create index if not exists tool_records_user_id_idx  on public.tool_records (user_id);
create index if not exists tool_records_tool_idx     on public.tool_records (user_id, tool_name);
create index if not exists tool_records_created_idx  on public.tool_records (created_at desc);


-- =============================================================================
-- TABLE: feedback
-- Stores before/after mood/stress feedback for condition activities.
-- =============================================================================

create table if not exists public.feedback (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users (id) on delete cascade,
  condition      text,
  before_mood    integer     check (before_mood between 1 and 10),
  after_mood     integer     check (after_mood between 1 and 10),
  before_stress  integer     check (before_stress between 1 and 10),
  after_stress   integer     check (after_stress between 1 and 10),
  feedback_text  text,
  created_at     timestamptz not null default now()
);

comment on table public.feedback is 'Before/after mood and stress feedback for activities.';

create index if not exists feedback_user_id_idx   on public.feedback (user_id);
create index if not exists feedback_condition_idx on public.feedback (user_id, condition);
create index if not exists feedback_created_idx   on public.feedback (created_at desc);


-- =============================================================================
-- ROW LEVEL SECURITY
-- Enabled on every user-owned table.
-- Users can only read/write their own rows.
-- =============================================================================

alter table public.profiles          enable row level security;
alter table public.analyses          enable row level security;
alter table public.condition_progress enable row level security;
alter table public.activity_logs     enable row level security;
alter table public.tool_usage        enable row level security;
alter table public.tool_records      enable row level security;
alter table public.feedback          enable row level security;


-- ---------------------------------------------------------------------------
-- POLICIES: profiles
-- ---------------------------------------------------------------------------

create policy "profiles: users read own row"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles: users insert own row"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles: users update own row"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles: users delete own row"
  on public.profiles for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- POLICIES: analyses
-- ---------------------------------------------------------------------------

create policy "analyses: users read own rows"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "analyses: users insert own rows"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "analyses: users delete own rows"
  on public.analyses for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- POLICIES: condition_progress
-- ---------------------------------------------------------------------------

create policy "condition_progress: users read own rows"
  on public.condition_progress for select
  using (auth.uid() = user_id);

create policy "condition_progress: users insert own rows"
  on public.condition_progress for insert
  with check (auth.uid() = user_id);

create policy "condition_progress: users update own rows"
  on public.condition_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "condition_progress: users delete own rows"
  on public.condition_progress for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- POLICIES: activity_logs
-- ---------------------------------------------------------------------------

create policy "activity_logs: users read own rows"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "activity_logs: users insert own rows"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

create policy "activity_logs: users update own rows"
  on public.activity_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "activity_logs: users delete own rows"
  on public.activity_logs for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- POLICIES: tool_usage
-- ---------------------------------------------------------------------------

create policy "tool_usage: users read own rows"
  on public.tool_usage for select
  using (auth.uid() = user_id);

create policy "tool_usage: users insert own rows"
  on public.tool_usage for insert
  with check (auth.uid() = user_id);

create policy "tool_usage: users delete own rows"
  on public.tool_usage for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- POLICIES: tool_records
-- ---------------------------------------------------------------------------

create policy "tool_records: users read own rows"
  on public.tool_records for select
  using (auth.uid() = user_id);

create policy "tool_records: users insert own rows"
  on public.tool_records for insert
  with check (auth.uid() = user_id);

create policy "tool_records: users delete own rows"
  on public.tool_records for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- POLICIES: feedback
-- ---------------------------------------------------------------------------

create policy "feedback: users read own rows"
  on public.feedback for select
  using (auth.uid() = user_id);

create policy "feedback: users insert own rows"
  on public.feedback for insert
  with check (auth.uid() = user_id);

create policy "feedback: users delete own rows"
  on public.feedback for delete
  using (auth.uid() = user_id);


-- =============================================================================
-- TRIGGER: auto-create profile on new user sign-up
-- When Supabase creates a new auth.users row, this trigger inserts the
-- matching profile row automatically.
-- The uid is stored in user_metadata.uid set during sign-up.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
-- Only the function owner (postgres) can execute this, not the anon role.
set search_path = public
as $$
begin
  insert into public.profiles (user_id, uid)
  values (
    new.id,
    -- Pull the WB-XXXXXX uid from the metadata set during sign-up
    coalesce(new.raw_user_meta_data->>'uid', 'WB-' || upper(substring(new.id::text, 1, 6)))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Drop the trigger first so this migration is idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
