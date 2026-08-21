-- =============================================================================
-- 003_phase6_journal_schema.sql
-- Mental Wellbeing App — Phase 6 Journal & Journey Database Schema Extension
--
-- Extends the existing feedback table to support before/after intensity ratings,
-- deterministic improvement scores, current feeling labels, and related activities.
-- Safe, idempotent migration preserving existing columns and RLS.
-- =============================================================================

alter table public.feedback
  add column if not exists before_intensity integer check (before_intensity between 1 and 10),
  add column if not exists after_intensity integer check (after_intensity between 1 and 10),
  add column if not exists improvement integer,
  add column if not exists status text,
  add column if not exists current_feeling text,
  add column if not exists related_activity text;

comment on column public.feedback.before_intensity is 'Self-reported intensity (1-10) before relief activities.';
comment on column public.feedback.after_intensity is 'Self-reported intensity (1-10) after relief activities.';
comment on column public.feedback.improvement is 'Calculated change: before_intensity - after_intensity.';
comment on column public.feedback.status is 'Deterministic status: Improved, No significant change, or Worsened.';
comment on column public.feedback.current_feeling is 'Selected emoji or current feeling label.';
comment on column public.feedback.related_activity is 'Name or ID of related condition/activity if available.';

-- Index on created_at for fast chronological queries
create index if not exists feedback_created_at_idx on public.feedback (user_id, created_at desc);
