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
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-[4.25rem] border-b border-stone-900/10 dark:border-sun-300/10 bg-[#FFFBF0]/80 dark:bg-[#0C0A05]/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors">

      <!-- Left: Mobile menu + language selector + spotlight -->
      <div class="flex items-center gap-2 sm:gap-3">
        <button
          (click)="mobileMenuOpen = !mobileMenuOpen"
          class="lg:hidden p-2 rounded-xl bg-white border border-stone-900/10 text-stone-700 dark:bg-white/5 dark:border-sun-300/10 dark:text-stone-300 hover:bg-sun-200 dark:hover:bg-sun-400/15 transition-colors"
          title="Toggle Navigation"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Language Switcher -->
        <div class="relative">
          <button
            (click)="dropdownOpen = !dropdownOpen"
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-sun-100 border border-stone-900/10 dark:bg-white/5 dark:hover:bg-sun-400/10 dark:border-sun-300/10 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all transform active:scale-95 shadow-sm"
          >
            <span class="text-base select-none">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="font-extrabold">{{ langService.selectedLanguage().name }}</span>
            <span class="text-[9px] text-sun-700 dark:text-sun-300 font-mono uppercase font-extrabold tracking-wider bg-sun-100 dark:bg-sun-400/10 px-1.5 py-0.5 rounded">
              {{ langService.selectedLanguage().script_direction }}
            </span>
            <svg class="w-3.5 h-3.5 opacity-50" [class.rotate-180]="dropdownOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            *ngIf="dropdownOpen"
            class="absolute top-12 left-0 w-64 rounded-2xl border-2 border-stone-900/10 dark:border-sun-300/15 bg-white dark:bg-[#1A150A] p-2 shadow-[6px_6px_0_0_#F5B800] z-50 animate-fadeIn"
          >
            <div class="text-[9px] font-mono uppercase text-stone-400 dark:text-stone-500 px-3 py-1.5 font-extrabold tracking-[0.16em]">
              Target tongue
            </div>
            <button
              *ngFor="let l of langService.languages()"
              (click)="selectLanguage(l.id)"
              class="w-full text-left p-2.5 rounded-xl flex items-center justify-between hover:bg-sun-100 dark:hover:bg-sun-400/10 text-xs text-stone-700 dark:text-stone-300 transition-colors"
              [class.bg-sun-200]="langService.selectedLanguage().id === l.id"
              [class.dark:bg-sun-400/10]="langService.selectedLanguage().id === l.id"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-xl select-none">{{ l.flag_emoji }}</span>
                <div>
                  <div class="font-extrabold text-stone-900 dark:text-stone-100">{{ l.name }}</div>
                  <div class="text-[10px] text-stone-500 dark:text-stone-400">{{ l.native_name }}</div>
                </div>
              </div>
              <span class="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-stone-400 uppercase font-bold">
                {{ l.script_direction }}
              </span>
            </button>
          </div>
        </div>

        <!-- Spotlight -->
        <button
          (click)="onOpenSpotlight.emit()"
          class="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/70 hover:bg-sun-100 border border-stone-900/10 dark:bg-white/5 dark:hover:bg-sun-400/10 dark:border-sun-300/10 text-stone-500 dark:text-stone-400 text-xs transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span class="font-semibold">Search or command...</span>
          <span class="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-sun-100 dark:bg-sun-400/10 text-sun-800 dark:text-sun-300 border border-sun-600/20 dark:border-sun-300/20">
            Ctrl+K
          </span>
        </button>
      </div>

      <!-- Right: stats + controls -->
      <div class="flex items-center gap-1.5 sm:gap-2.5">

        <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sun-200 border border-sun-600/25 text-sun-900 dark:bg-sun-400/10 dark:border-sun-300/20 dark:text-sun-300 text-xs font-mono font-extrabold" title="Daily streak">
          <span class="animate-flame">🔥</span>
          <span>{{ progress.streak() }}d</span>
        </div>

        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-100 border border-orange-600/20 text-orange-800 dark:bg-orange-400/10 dark:border-orange-300/20 dark:text-orange-300 text-xs font-mono font-extrabold" title="Gems">
          <span>💎</span>
          <span>{{ progress.gems() }}</span>
        </div>

        <button
          (click)="cycleRate()"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-sun-100 dark:bg-white/5 dark:hover:bg-sun-400/10 border border-stone-900/10 dark:border-sun-300/10 text-stone-700 dark:text-stone-300 text-xs font-mono font-bold transition-all transform active:scale-95"
          title="Cycle Text-To-Speech velocity"
        >
          <span>⏱️</span>
          <span>{{ tts.playbackRate() }}x</span>
        </button>

        <button
          (click)="themeService.toggleTheme()"
          class="p-2 rounded-xl bg-white hover:bg-sun-100 dark:bg-white/5 dark:hover:bg-sun-400/10 border border-stone-900/10 dark:border-sun-300/10 text-stone-700 dark:text-stone-300 transition-all hover:rotate-12 active:scale-90 flex items-center justify-center"
          [title]="themeService.theme() === 'dark' ? 'Switch to sunny light' : 'Switch to moonlight'"
          aria-label="Toggle color theme"
        >
          <svg *ngIf="themeService.theme() === 'dark'" class="w-4 h-4 text-sun-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg *ngIf="themeService.theme() === 'light'" class="w-4 h-4 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <a
          routerLink="/settings"
          class="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl bg-white hover:bg-sun-100 dark:bg-white/5 dark:hover:bg-sun-400/10 border border-stone-900/10 dark:border-sun-300/10 transition-colors"
          [title]="'Signed in as ' + (auth.currentUser()?.name || 'Explorer')"
        >
          <span class="grid h-7 w-7 place-items-center rounded-lg bg-sun-200 text-sm select-none overflow-hidden shrink-0 dark:bg-sun-400/15">
            <img *ngIf="isAvatarUrl(auth.currentUser()?.avatar); else emojiAvatar"
                 [src]="auth.currentUser()?.avatar"
                 alt="Avatar"
                 class="h-full w-full object-cover rounded-lg" />
            <ng-template #emojiAvatar>
              <span>{{ auth.currentUser()?.avatar || '🧑‍🚀' }}</span>
            </ng-template>
          </span>
          <span class="hidden lg:inline text-xs font-bold text-stone-800 dark:text-stone-200 max-w-[100px] truncate">
            {{ auth.currentUser()?.name || 'Explorer' }}
          </span>
        </a>
      </div>

      <!-- Mobile nav -->
      <div
        *ngIf="mobileMenuOpen"
        class="lg:hidden absolute top-[4.25rem] left-0 right-0 border-b border-stone-900/10 dark:border-sun-300/10 bg-[#FFFBF0]/97 dark:bg-[#120F07]/97 backdrop-blur-xl p-4 shadow-2xl z-50 grid grid-cols-2 gap-1.5 animate-fadeIn"
      >
        <a *ngFor="let item of mobileNav" [routerLink]="item.link" (click)="mobileMenuOpen = false" class="p-2.5 rounded-xl bg-white/60 hover:bg-sun-200 dark:bg-white/5 dark:hover:bg-sun-400/10 text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <span>{{ item.icon }}</span>{{ item.label }}
        </a>
      </div>
    </header>
  `,
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
  public auth = inject(AuthService);
  private toast = inject(ToastService);

  public dropdownOpen = false;
  public mobileMenuOpen = false;

  public mobileNav = [
    { icon: '📊', label: 'Dashboard', link: '/dashboard' },
    { icon: '🗺️', label: 'Curriculum', link: '/curriculum' },
    { icon: '🎙️', label: 'Studio', link: '/studio' },
    { icon: '📚', label: 'Vocabulary', link: '/vocabulary' },
    { icon: '🔬', label: 'Phonetics', link: '/phonetics' },
    { icon: '🧩', label: 'Grammar', link: '/grammar' },
    { icon: '🎭', label: 'Roleplay', link: '/roleplay' },
    { icon: '🏆', label: 'League', link: '/leaderboard' },
    { icon: '⚙️', label: 'Settings', link: '/settings' },
    { icon: '☀️', label: 'Home', link: '/welcome' },
  ];

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

  isAvatarUrl(avatar?: string | null): boolean {
    return !!avatar && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:'));
  }
}
