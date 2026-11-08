import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { SupabaseService } from '../../services/supabase.service';
import { TextToSpeechService } from '../../services/text-to-speech.service';
import { SRSEngineService } from '../../services/srs-engine.service';
import { UserProgressService } from '../../services/user-progress.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-16 border-b border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors">
      
      <!-- Left: Mobile Nav Toggle + Language Quick Selector -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Mobile Navigation Toggle Button -->
        <button
          (click)="mobileMenuOpen = !mobileMenuOpen"
          class="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white transition-colors"
          title="Toggle Navigation"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Language Switcher Pill -->
        <div class="relative">
          <button
            (click)="dropdownOpen = !dropdownOpen"
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-all transform active:scale-95 shadow-sm"
          >
            <span class="text-base select-none">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="font-bold">{{ langService.selectedLanguage().name }}</span>
            <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono uppercase font-bold tracking-wider">
              {{ langService.selectedLanguage().script_direction }}
            </span>
            <svg class="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            *ngIf="dropdownOpen"
            class="absolute top-12 left-0 w-64 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 shadow-2xl z-50 animate-fadeIn"
          >
            <div class="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500 px-3 py-1 font-semibold tracking-wider">
              Target Tongue
            </div>
            <button
              *ngFor="let l of langService.languages()"
              (click)="selectLanguage(l.id)"
              class="w-full text-left p-2.5 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-xs text-slate-700 dark:text-zinc-300 transition-colors"
              [class.bg-indigo-50]="langService.selectedLanguage().id === l.id && themeService.theme() === 'light'"
              [class.dark:bg-zinc-800]="langService.selectedLanguage().id === l.id"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-xl select-none">{{ l.flag_emoji }}</span>
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">{{ l.name }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-zinc-400">{{ l.native_name }}</div>
                </div>
              </div>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 uppercase font-semibold">
                {{ l.script_direction }}
              </span>
            </button>
          </div>
        </div>

        <!-- Global Spotlight Trigger Button -->
        <button
          (click)="onOpenSpotlight.emit()"
          class="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/60 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-xs transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search or Command...</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            Ctrl+K
          </span>
        </button>
      </div>

      <!-- Right: User Stats & Controls & Theme Switcher -->
      <div class="flex items-center gap-2 sm:gap-2.5">
        
        <!-- Streak Flame -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold">
          <span>🔥</span>
          <span>{{ progress.streak() }}d</span>
        </div>

        <!-- Gems Counter -->
        <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold">
          <span>💎</span>
          <span>{{ progress.gems() }}</span>
        </div>

        <!-- Speech Velocity Control -->
        <button
          (click)="cycleRate()"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-mono font-semibold transition-all transform active:scale-95"
          title="Cycle Text-To-Speech velocity"
        >
          <span>⏱️</span>
          <span>{{ tts.playbackRate() }}x</span>
        </button>

        <!-- LIGHT / DARK THEME TOGGLE BUTTON -->
        <button
          (click)="themeService.toggleTheme()"
          class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors flex items-center justify-center"
          [title]="themeService.theme() === 'dark' ? 'Switch to Clean Light Theme' : 'Switch to Refined Dark Theme'"
        >
          <!-- Sun Icon (for dark mode) -->
          <svg *ngIf="themeService.theme() === 'dark'" class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- Moon Icon (for light mode) -->
          <svg *ngIf="themeService.theme() === 'light'" class="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Supabase Connectivity Pill -->
        <button
          (click)="onOpenSupabase.emit()"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all transform active:scale-95"
          [ngClass]="supabase.isConfigured() ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'"
          title="Supabase Database Status"
        >
          <span class="relative flex h-2 w-2">
            <span
              *ngIf="supabase.isConfigured()"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2"
              [ngClass]="supabase.isConfigured() ? 'bg-emerald-500' : 'bg-slate-400'"
            ></span>
          </span>
          <span class="hidden md:inline">
            {{ supabase.isConfigured() ? 'Cloud Synced' : 'Offline Mode' }}
          </span>
        </button>
      </div>

      <!-- Mobile Dropdown Navigation Menu -->
      <div
        *ngIf="mobileMenuOpen"
        class="lg:hidden absolute top-16 left-0 right-0 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl p-4 shadow-2xl z-50 flex flex-col gap-1.5 animate-fadeIn"
      >
        <a routerLink="/dashboard" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">📊 Dashboard & Analytics</a>
        <a routerLink="/curriculum" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">🗺️ Curriculum Roadmap</a>
        <a routerLink="/studio" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">🎙️ Interactive Studio</a>
        <a routerLink="/vocabulary" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">📚 Vocabulary Vault</a>
        <a routerLink="/phonetics" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">🔬 Phonetics Lab</a>
        <a routerLink="/grammar" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">🧩 Grammar Matrix</a>
        <a routerLink="/roleplay" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">🎭 AI Roleplay Arena</a>
        <a routerLink="/leaderboard" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">🏆 Diamond League</a>
        <a routerLink="/settings" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200">⚙️ Settings & Database</a>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Output() onOpenSpotlight = new EventEmitter<void>();
  @Output() onOpenSupabase = new EventEmitter<void>();

  public langService = inject(LanguageService);
  public supabase = inject(SupabaseService);
  public tts = inject(TextToSpeechService);
  public srsService = inject(SRSEngineService);
  public progress = inject(UserProgressService);
  public themeService = inject(ThemeService);
  private toast = inject(ToastService);

  public dropdownOpen = false;
  public mobileMenuOpen = false;

  selectLanguage(langId: string) {
    this.langService.selectLanguage(langId);
    this.dropdownOpen = false;
    this.toast.show(`Switched active language to ${this.langService.selectedLanguage().name}!`, 'success');
  }

  cycleRate() {
    const cur = this.tts.playbackRate();
    if (cur === 0.75) {
      this.tts.setRate(1.0);
      this.toast.show('TTS Velocity: 1.0x (Standard tempo)', 'info', 1800);
    } else if (cur === 1.0) {
      this.tts.setRate(1.25);
      this.toast.show('TTS Velocity: 1.25x (Native tempo)', 'info', 1800);
    } else {
      this.tts.setRate(0.75);
      this.toast.show('TTS Velocity: 0.75x (Measured mode)', 'info', 1800);
    }
  }
}
