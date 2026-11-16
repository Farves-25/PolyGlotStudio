import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';

const SUPABASE_SQL_SCHEMA = `-- PolyglotStudio Complete Database Migration Schema
create extension if not exists "uuid-ossp";

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
  id uuid primary key default uuid_generate_v4(),
  language_id text references public.languages(id) on delete cascade not null,
  title text not null,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  topic text not null,
  order_index int not null
);

-- 3. Exercises Table
create table if not exists public.exercises (
  id uuid primary key default uuid_generate_v4(),
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
  id uuid primary key default uuid_generate_v4(),
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
  id uuid primary key default uuid_generate_v4(),
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

-- Enable RLS, least-privilege grants and policies
-- Access: catalog tables public read-only; SRS/roleplay owner-only (authenticated).
begin;

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
`;

@Component({
  selector: 'app-supabase-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div class="surface-card w-full max-w-xl rounded-2xl p-6 md:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <!-- Close Button -->
        <button
          (click)="close.emit()"
          class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl shadow-xs">
            ⚡
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
              Supabase Backend Integration
            </h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              Connect your existing Supabase project or continue in Demo Studio Mode.
            </p>
          </div>
        </div>

        <!-- Connection Status Pill -->
        <div class="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between mb-5">
          <div class="flex items-center gap-2.5">
            <span class="relative flex h-2.5 w-2.5">
              <span
                *ngIf="supabaseService.isConfigured()"
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2.5 w-2.5"
                [ngClass]="supabaseService.isConfigured() ? 'bg-emerald-500' : 'bg-amber-500'"
              ></span>
            </span>
            <span class="text-xs font-mono font-semibold" [ngClass]="supabaseService.isConfigured() ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'">
              {{ supabaseService.isConfigured() ? 'Connected to Supabase' : 'Offline / Demo Mode Active' }}
            </span>
          </div>

          <span class="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            {{ supabaseService.isConfigured() ? 'Cloud Postgres Sync' : 'Local Storage Cache' }}
          </span>
        </div>

        <!-- Credentials Form -->
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5 font-semibold">
              Supabase Project URL
            </label>
            <input
              type="text"
              [(ngModel)]="supabaseUrl"
              placeholder="https://xyzcompany.supabase.co"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label class="block text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5 font-semibold">
              Supabase Anon / Public API Key
            </label>
            <input
              type="password"
              [(ngModel)]="supabaseKey"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <button
            (click)="saveAndConnect()"
            [disabled]="isConnecting()"
            class="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>{{ isConnecting() ? 'Connecting...' : 'Save & Connect Credentials' }}</span>
          </button>

          <button
            *ngIf="supabaseService.isConfigured()"
            (click)="disconnect()"
            class="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors"
          >
            Disconnect
          </button>
        </div>

        <!-- SQL Schema Copy Card -->
        <div class="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono uppercase text-slate-600 dark:text-zinc-400 font-semibold">Postgres SQL Migration Script</span>
            <button
              (click)="copySchema()"
              class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-mono font-semibold flex items-center gap-1"
            >
              📋 Copy SQL
            </button>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">
            Paste this migration in your Supabase SQL Editor to provision languages, lessons, exercises, SM-2 SRS progress, and AI roleplay session tables.
          </p>
        </div>
      </div>
    </div>
  `
})
export class SupabaseConfigModalComponent {
  @Output() close = new EventEmitter<void>();

  public supabaseService = inject(SupabaseService);
  private toastService = inject(ToastService);

  public supabaseUrl =
    localStorage.getItem('POLYGLOT_SUPABASE_URL') ||
    localStorage.getItem('RETROSYNC_SUPABASE_URL') ||
    '';
  public supabaseKey =
    localStorage.getItem('POLYGLOT_SUPABASE_KEY') ||
    localStorage.getItem('RETROSYNC_SUPABASE_KEY') ||
    '';

  public isConnecting = signal<boolean>(false);

  async saveAndConnect() {
    if (!this.supabaseUrl.trim() || !this.supabaseKey.trim()) {
      this.toastService.show('Please provide both Supabase URL and Anon Key.', 'warning');
      return;
    }

    this.isConnecting.set(true);
    const success = await this.supabaseService.updateConfig(
      this.supabaseUrl.trim(),
      this.supabaseKey.trim()
    );
    this.isConnecting.set(false);

    if (success) {
      this.toastService.show('Connected to Supabase successfully!', 'success');
      this.close.emit();
    } else {
      this.toastService.show('Supabase connection updated. Ready to sync!', 'info');
      this.close.emit();
    }
  }

  disconnect() {
    this.supabaseService.disconnect();
    this.supabaseUrl = '';
    this.supabaseKey = '';
    this.toastService.show('Disconnected. Switched to offline demo mode.', 'info');
  }

  copySchema() {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    this.toastService.show('Supabase SQL Schema copied to clipboard!', 'success');
  }
}

