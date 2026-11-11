import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProgressService } from '../../services/user-progress.service';
import { AudioSfxService } from '../../services/audio-sfx.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  shortLabel?: string;
  icon: string;
  link: string;
  dynamic?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-[17rem] bg-[#FFFBEB] dark:bg-[#120F07] border-r border-stone-900/10 dark:border-sun-300/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 transition-colors">

      <!-- Top Brand -->
      <div class="min-h-0 flex flex-1 flex-col overflow-hidden">
        <div class="p-5 flex items-center gap-3 border-b border-stone-900/10 dark:border-sun-300/10 relative overflow-hidden">
          <div class="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-sun-300/50 blur-2xl dark:bg-sun-400/10"></div>
          <a routerLink="/welcome" class="relative w-11 h-11 rounded-2xl bg-sun-400 border-2 border-stone-950 dark:border-sun-200 flex items-center justify-center text-xl shadow-[3px_3px_0_0_#1c1917] dark:shadow-[3px_3px_0_0_rgba(255,226,77,0.8)] transition-transform hover:-rotate-6 hover:scale-105" title="Back to the sunny landing page">
            ☀️
          </a>
          <div class="relative">
            <div class="flex items-center gap-2">
              <span class="font-display font-extrabold text-base tracking-tight text-stone-950 dark:text-cream">PolyglotStudio</span>
              <span class="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-extrabold bg-sun-300 text-stone-950 border border-stone-950/20 dark:bg-sun-400/20 dark:text-sun-200 dark:border-sun-300/20">
                PRO
              </span>
            </div>
            <span class="text-[10px] font-semibold text-stone-500 dark:text-stone-400">Language Acquisition OS</span>
          </div>
        </div>

        <!-- Level strip -->
        <div class="px-4 pt-4">
          <div class="rounded-2xl border-2 border-stone-950/10 bg-white/70 p-3 dark:border-sun-300/10 dark:bg-white/[0.03]">
            <div class="flex items-center justify-between text-[10px] mb-2">
              <span class="font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span class="grid h-5 w-5 place-items-center rounded-md bg-sun-300 text-[10px] text-stone-950">⚡</span>
                Level {{ progress.level() }}
              </span>
              <span class="font-mono font-bold text-sun-700 dark:text-sun-300">{{ progress.xp() }} XP</span>
            </div>
            <div class="w-full bg-stone-900/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-sun-500 via-sun-400 to-orange-400 h-full rounded-full transition-all duration-700 shimmer"
                [style.width.%]="progress.levelProgressPercent()"
              ></div>
            </div>
            <div class="mt-1.5 flex justify-between text-[9px] font-mono font-semibold text-stone-400 dark:text-stone-500">
              <span>Sunny Scholar</span>
              <span>{{ progress.levelProgressPercent() }}%</span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="p-3 space-y-1 overflow-y-auto flex-1">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.dynamic ? ['/learn', langService.selectedLanguage().id] : item.link"
            routerLinkActive="bg-sun-300 text-stone-950 border-stone-950/20 shadow-[3px_3px_0_0_#1c1917] dark:bg-sun-400/15 dark:text-sun-200 dark:border-sun-300/25 dark:shadow-[3px_3px_0_0_rgba(255,210,30,0.25)]"
            [routerLinkActiveOptions]="{ exact: false }"
            class="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white bg-transparent hover:bg-sun-200/50 dark:hover:bg-sun-400/10 border border-transparent transition-all duration-200 hover:translate-x-0.5 font-semibold"
          >
            <span class="text-base transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">{{ item.icon }}</span>
            <span class="flex-1">{{ item.label }}</span>
            <span *ngIf="item.badge" class="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-extrabold bg-sun-200 text-sun-900 border border-sun-600/20 dark:bg-sun-400/15 dark:text-sun-300 dark:border-sun-300/20">
              {{ item.badge }}
            </span>
            <span class="text-sun-600 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 dark:text-sun-300">→</span>
          </a>
        </nav>
      </div>

      <!-- Bottom Profile Card -->
      <div class="p-4 border-t border-stone-900/10 dark:border-sun-300/10 bg-white/50 dark:bg-white/[0.02] relative overflow-hidden">
        <div class="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-sun-300/40 blur-2xl dark:bg-sun-400/10"></div>

        <!-- Quick Stats -->
        <div class="relative flex items-center justify-between gap-2 text-xs">
          <div class="flex items-center gap-1.5 rounded-lg border border-sun-600/20 bg-sun-100 px-2 py-1 text-sun-800 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-300 font-mono font-extrabold" title="Daily study streak">
            <span class="animate-flame">🔥</span>
            <span>{{ progress.streak() }}d</span>
          </div>

          <div class="flex items-center gap-1.5 rounded-lg border border-orange-600/20 bg-orange-100 px-2 py-1 text-orange-800 dark:border-orange-300/20 dark:bg-orange-400/10 dark:text-orange-300 font-mono font-extrabold" title="Gems collected">
            <span>💎</span>
            <span>{{ progress.gems() }}</span>
          </div>

          <button
            (click)="sfx.toggleSound()"
            class="px-2 py-1 rounded-lg border text-[10px] font-mono font-bold transition-colors"
            [ngClass]="sfx.soundEnabled() ? 'bg-sun-200 border-sun-600/25 text-sun-900 dark:bg-sun-400/15 dark:border-sun-300/25 dark:text-sun-200' : 'bg-stone-100 border-stone-900/10 text-stone-500 dark:bg-white/5 dark:border-sun-300/10 dark:text-stone-400'"
            title="Toggle Web Audio SFX"
          >
            {{ sfx.soundEnabled() ? '🔊' : '🔇' }}
          </button>

          <button
            (click)="themeService.toggleTheme()"
            class="p-1.5 rounded-lg border border-stone-900/10 bg-white text-stone-600 hover:bg-sun-200 hover:text-stone-950 dark:border-sun-300/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-sun-400/15 dark:hover:text-sun-200 transition-all active:scale-90"
            [title]="themeService.theme() === 'dark' ? 'Switch to sunny light' : 'Switch to moonlight'"
          >
            <span class="text-[11px]">{{ themeService.theme() === 'dark' ? '☀️' : '🌙' }}</span>
          </button>
        </div>

        <!-- Learner Account -->
        <div class="relative mt-3 pt-3 border-t border-stone-900/10 dark:border-sun-300/10 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2 overflow-hidden">
            <span class="grid h-9 w-9 place-items-center rounded-xl border border-stone-900/10 bg-sun-100 text-base select-none shrink-0 overflow-hidden dark:border-sun-300/10 dark:bg-sun-400/10">
              <img *ngIf="isAvatarUrl(auth.currentUser()?.avatar); else emojiAvatar"
                   [src]="auth.currentUser()?.avatar"
                   alt="Avatar"
                   class="h-full w-full object-cover rounded-xl" />
              <ng-template #emojiAvatar>
                <span>{{ auth.currentUser()?.avatar || '🧑‍🚀' }}</span>
              </ng-template>
            </span>
            <div class="truncate">
              <div class="font-extrabold text-stone-800 dark:text-stone-100 truncate leading-tight">
                {{ auth.currentUser()?.name || 'Explorer' }}
              </div>
              <div class="text-[10px] text-stone-400 dark:text-stone-500 font-mono capitalize">
                {{ auth.currentUser()?.provider || 'demo' }} account
              </div>
            </div>
          </div>

          <button
            (click)="auth.signOut()"
            class="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Sign out / Switch account"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  public progress = inject(UserProgressService);
  public sfx = inject(AudioSfxService);
  public themeService = inject(ThemeService);
  public langService = inject(LanguageService);
  public auth = inject(AuthService);

  public navItems: NavItem[] = [
    { label: 'Dashboard & Analytics', icon: '📊', link: '/dashboard' },
    { label: 'Travel Phrasebook', icon: '📖', link: '/learn', dynamic: true, badge: '420+' },
    { label: 'Curriculum Roadmap', icon: '🗺️', link: '/curriculum' },
    { label: 'Interactive Studio', icon: '🎙️', link: '/studio' },
    { label: 'Vocabulary Vault', icon: '📚', link: '/vocabulary' },
    { label: 'Phonetics & IPA Lab', icon: '🔬', link: '/phonetics' },
    { label: 'Grammar Matrix', icon: '🧩', link: '/grammar' },
    { label: 'AI Dialogue Arena', icon: '🎭', link: '/roleplay' },
    { label: 'Diamond League', icon: '🏆', link: '/leaderboard' },
    { label: 'Studio Settings', icon: '⚙️', link: '/settings' },
  ];

  isAvatarUrl(avatar?: string | null): boolean {
    return !!avatar && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:'));
  }
}
