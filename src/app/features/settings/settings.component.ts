import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { ToastService } from '../../core/services/toast.service';
import { UserProgressService } from '../../core/services/user-progress.service';

const SUPABASE_MIGRATION_SQL = `-- PolyglotStudio Complete Database Migration Schema
create extension if not exists "uuid-ossp";

create table if not exists public.languages (
  id text primary key,
  name text not null,
  native_name text not null,
  flag_emoji text not null,
  script_direction text default 'ltr' check (script_direction in ('ltr', 'rtl')),
  locale_code text not null
);

insert into public.languages (id, name, native_name, flag_emoji, script_direction, locale_code) values
('es', 'Spanish', 'Español', '🇪🇸', 'ltr', 'es-ES'),
('de', 'German', 'Deutsch', '🇩🇪', 'ltr', 'de-DE'),
('ja', 'Japanese', '日本語', '🇯🇵', 'ltr', 'ja-JP'),
('ar', 'Arabic', 'العربية', '🇸🇦', 'rtl', 'ar-SA'),
('fr', 'French', 'Français', '🇫🇷', 'ltr', 'fr-FR'),
('ta', 'Tamil', 'தமிழ்', '🇮🇳', 'ltr', 'ta-IN')
on conflict (id) do nothing;

create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  language_id text references public.languages(id) on delete cascade not null,
  title text not null,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  topic text not null,
  order_index int not null
);

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

create table if not exists public.roleplay_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  language_id text references public.languages(id) not null,
  scenario text not null,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.languages enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.user_srs_progress enable row level security;
alter table public.roleplay_sessions enable row level security;

create policy if not exists "Allow public read on languages" on public.languages for select using (true);
create policy if not exists "Allow public read on lessons" on public.lessons for select using (true);
create policy if not exists "Allow public read on exercises" on public.exercises for select using (true);
create policy if not exists "Users manage own SRS progress" on public.user_srs_progress for all using (auth.uid() = user_id);
create policy if not exists "Users manage roleplay" on public.roleplay_sessions for all using (auth.uid() = user_id);
`;

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Studio Preferences & Backend Integration
        </h2>
        <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Manage your cloud Supabase database, Web Speech synthesis parameters, and telemetry.
        </p>
      </div>

      <!-- SECTION 1: SUPABASE CONFIGURATION -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚡</span>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Supabase Cloud Database</h3>
              <p class="text-xs text-slate-500 dark:text-zinc-400">Postgres DB, Row-Level Security, Auth session persistence</p>
            </div>
          </div>

          <span
            class="px-3 py-1 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 border"
            [ngClass]="supabase.isConfigured() ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'"
          >
            <span class="w-2 h-2 rounded-full" [ngClass]="supabase.isConfigured() ? 'bg-emerald-500' : 'bg-amber-500'"></span>
            {{ supabase.isConfigured() ? 'Connected' : 'Offline Demo Mode' }}
          </span>
        </div>

        <div class="grid grid-cols-1 gap-4 text-xs">
          <div>
            <label class="block font-mono uppercase text-slate-600 dark:text-zinc-400 mb-1 font-semibold">Supabase Project URL</label>
            <input
              type="text"
              [(ngModel)]="supabaseUrl"
              placeholder="https://your-project.supabase.co"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block font-mono uppercase text-slate-600 dark:text-zinc-400 mb-1 font-semibold">Supabase Anon Key</label>
            <input
              type="password"
              [(ngModel)]="supabaseKey"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div class="flex items-center gap-3">
            <button
              (click)="saveCredentials()"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              Save & Reconnect
            </button>
            <button
              *ngIf="supabase.isConfigured()"
              (click)="disconnect()"
              class="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors border border-rose-200 dark:border-rose-800"
            >
              Disconnect
            </button>
          </div>

          <button
            (click)="copySqlSchema()"
            class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-mono font-medium transition-colors border border-slate-200 dark:border-zinc-700 flex items-center gap-2"
          >
            <span>📋</span>
            <span>Copy Complete SQL Schema</span>
          </button>
        </div>
      </div>

      <!-- SECTION 2: AUDIO SYNTHESIS & SFX -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-zinc-800/80">
          <span class="text-2xl">🎙️</span>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Audio & Speech Synthesis Engine</h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Web Speech API rate controls and procedural UI sound effects</p>
          </div>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <div class="flex justify-between mb-1.5 font-mono">
              <span class="text-slate-700 dark:text-zinc-300 font-semibold">Native Speech Velocity</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-bold">{{ tts.playbackRate() }}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              [ngModel]="tts.playbackRate()"
              (ngModelChange)="tts.setRate($event)"
              class="w-full accent-indigo-600"
            />
            <div class="flex justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
              <span>0.5x Slow</span>
              <span>1.0x Normal</span>
              <span>1.5x Rapid</span>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
            <div>
              <strong class="text-slate-900 dark:text-white block font-semibold">Web Audio UI Sound Effects</strong>
              <span class="text-[11px] text-slate-500 dark:text-zinc-400">Auditory chimes on successful phoneme matches and flips</span>
            </div>
            <button
              (click)="sfx.toggleSound()"
              class="px-3.5 py-1.5 rounded-xl border font-mono font-semibold text-xs transition-colors"
              [ngClass]="sfx.soundEnabled()
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700'"
            >
              {{ sfx.soundEnabled() ? 'Enabled' : 'Disabled' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  public supabase = inject(SupabaseService);
  public tts = inject(TextToSpeechService);
  public sfx = inject(AudioSfxService);
  private toast = inject(ToastService);

  public supabaseUrl =
    localStorage.getItem('POLYGLOT_SUPABASE_URL') ||
    localStorage.getItem('RETROSYNC_SUPABASE_URL') ||
    '';
  public supabaseKey =
    localStorage.getItem('POLYGLOT_SUPABASE_KEY') ||
    localStorage.getItem('RETROSYNC_SUPABASE_KEY') ||
    '';

  async saveCredentials() {
    if (!this.supabaseUrl.trim() || !this.supabaseKey.trim()) {
      this.toast.show('Please provide both URL and Anon Key.', 'warning');
      return;
    }
    const ok = await this.supabase.updateConfig(this.supabaseUrl.trim(), this.supabaseKey.trim());
    if (ok) {
      this.toast.show('Supabase credentials connected successfully!', 'success');
    }
  }

  disconnect() {
    this.supabase.disconnect();
    this.supabaseUrl = '';
    this.supabaseKey = '';
    this.toast.show('Disconnected. Switched to offline demo mode.', 'info');
  }

  copySqlSchema() {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    this.toast.show('Supabase SQL Schema copied to clipboard!', 'success');
  }
}

