-- =====================================================================
-- PolyGlotStudio: least-privilege Row Level Security
--
-- ACCESS MODEL (plain words)
--  * languages, lessons, exercises = shared learning content (catalog).
--    Anyone (logged in or not) may READ it. Nobody may change it through
--    the API; edit it from the Supabase dashboard / service role only.
--  * user_srs_progress, roleplay_sessions = private per-user data.
--    Only logged-in users, and only their OWN rows: they may read,
--    create, update and delete rows where user_id = their own id.
--    Logged-out visitors get nothing.
--  * A user can never create/move a row to another user, and the owner
--    column (and parent keys) cannot be changed after creation
--    (enforced by BEFORE UPDATE triggers).
--  * Safe to re-run.
-- =====================================================================
begin;

-- 0. Create tables if missing (so this file works on a fresh project) ----

-- 1. Languages Table
create table if not exists public.languages (
  id text primary key,
  name text not null,
  native_name text not null,
  flag_emoji text not null,
  script_direction text default 'ltr' check (script_direction in ('ltr', 'rtl')),
  locale_code text not null
);

-- Seed Supported Languages
insert into public.languages (id, name, native_name, flag_emoji, script_direction, locale_code) values
('es', 'Spanish', 'Español', '🇪🇸', 'ltr', 'es-ES'),
('de', 'German', 'Deutsch', '🇩🇪', 'ltr', 'de-DE'),
('ja', 'Japanese', '日本語', '🇯🇵', 'ltr', 'ja-JP'),
('ar', 'Arabic', 'العربية', '🇸🇦', 'rtl', 'ar-SA'),
('fr', 'French', 'Français', '🇫🇷', 'ltr', 'fr-FR'),
('ta', 'Tamil', 'தமிழ்', '🇮🇳', 'ltr', 'ta-IN')
on conflict (id) do nothing;

-- 2. Lessons Table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  language_id text references public.languages(id) on delete cascade not null,
  title text not null,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  topic text not null,
  order_index int not null
);

-- 3. Exercises Table
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  type text not null check (type in ('pronunciation', 'syntax_dissector', 'srs_card', 'dialogue')),
  prompt text not null,
  target_text text not null,
  phonetic_guide text,
  syntax_tokens jsonb default '[]'::jsonb,
  audio_url text,
  order_index int not null
);

-- 4. User SRS Spaced Repetition Progress (SM-2 Algorithm)
create table if not exists public.user_srs_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) on delete cascade not null,
  ease_factor numeric(4,2) default 2.50,
  interval_days int default 1,
  repetitions int default 0,
  due_date date default current_date not null,
  last_reviewed timestamptz default timezone('utc'::text, now()),
  unique(user_id, exercise_id)
);

-- 5. AI Conversation Sessions
create table if not exists public.roleplay_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  language_id text references public.languages(id) not null,
  scenario text not null,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_lessons_lang on public.lessons(language_id, order_index);
create index if not exists idx_exercises_lesson on public.exercises(lesson_id, order_index);
create index if not exists idx_srs_due on public.user_srs_progress(user_id, due_date);


-- 1. Enable RLS on every app table -------------------------------------
alter table public.languages         enable row level security;
alter table public.lessons           enable row level security;
alter table public.exercises         enable row level security;
alter table public.user_srs_progress enable row level security;
alter table public.roleplay_sessions enable row level security;

-- 2. Reset privileges, then grant only what is needed -------------------
revoke all on table public.languages, public.lessons, public.exercises,
                    public.user_srs_progress, public.roleplay_sessions
  from anon, authenticated;

grant select on public.languages, public.lessons, public.exercises
  to anon, authenticated;
grant select, insert, update, delete
  on public.user_srs_progress, public.roleplay_sessions
  to authenticated;

-- 3. Drop old open policies (names from the previous schema) ------------
drop policy if exists "Allow public read on languages" on public.languages;
drop policy if exists "Allow public read on lessons"   on public.lessons;
drop policy if exists "Allow public read on exercises" on public.exercises;
drop policy if exists "Users manage own SRS progress"  on public.user_srs_progress;
drop policy if exists "Users manage roleplay"          on public.roleplay_sessions;

-- 4. Catalog: read-only for everyone -------------------------------------
drop policy if exists languages_select on public.languages;
create policy languages_select on public.languages
  for select to anon, authenticated using (true);

drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons
  for select to anon, authenticated using (true);

drop policy if exists exercises_select on public.exercises;
create policy exercises_select on public.exercises
  for select to anon, authenticated using (true);

-- 5. user_srs_progress: owner only ---------------------------------------
drop policy if exists srs_select on public.user_srs_progress;
create policy srs_select on public.user_srs_progress
  for select to authenticated
  using (user_id::text = (select auth.uid())::text);

drop policy if exists srs_insert on public.user_srs_progress;
create policy srs_insert on public.user_srs_progress
  for insert to authenticated
  with check (user_id::text = (select auth.uid())::text);

drop policy if exists srs_update on public.user_srs_progress;
create policy srs_update on public.user_srs_progress
  for update to authenticated
  using (user_id::text = (select auth.uid())::text)
  with check (user_id::text = (select auth.uid())::text);

drop policy if exists srs_delete on public.user_srs_progress;
create policy srs_delete on public.user_srs_progress
  for delete to authenticated
  using (user_id::text = (select auth.uid())::text);

-- 6. roleplay_sessions: owner only ---------------------------------------
drop policy if exists roleplay_select on public.roleplay_sessions;
create policy roleplay_select on public.roleplay_sessions
  for select to authenticated
  using (user_id::text = (select auth.uid())::text);

drop policy if exists roleplay_insert on public.roleplay_sessions;
create policy roleplay_insert on public.roleplay_sessions
  for insert to authenticated
  with check (user_id::text = (select auth.uid())::text);

drop policy if exists roleplay_update on public.roleplay_sessions;
create policy roleplay_update on public.roleplay_sessions
  for update to authenticated
  using (user_id::text = (select auth.uid())::text)
  with check (user_id::text = (select auth.uid())::text);

drop policy if exists roleplay_delete on public.roleplay_sessions;
create policy roleplay_delete on public.roleplay_sessions
  for delete to authenticated
  using (user_id::text = (select auth.uid())::text);

-- 7. Immutability triggers (ownership / parent keys can't change) -------
-- Kept in a private schema that API roles cannot use.
create schema if not exists private;
revoke all on schema private from anon, authenticated;

create or replace function private.protect_srs_keys()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.user_id::text is distinct from old.user_id::text
     or new.exercise_id::text is distinct from old.exercise_id::text then
    raise exception 'user_id and exercise_id cannot be changed';
  end if;
  return new;
end;
$$;

create or replace function private.protect_roleplay_keys()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.user_id::text is distinct from old.user_id::text then
    raise exception 'user_id cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_srs_keys on public.user_srs_progress;
create trigger trg_protect_srs_keys
  before update on public.user_srs_progress
  for each row execute function private.protect_srs_keys();

drop trigger if exists trg_protect_roleplay_keys on public.roleplay_sessions;
create trigger trg_protect_roleplay_keys
  before update on public.roleplay_sessions
  for each row execute function private.protect_roleplay_keys();

commit;
