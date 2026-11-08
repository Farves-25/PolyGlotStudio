import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserProgressService } from '../../services/user-progress.service';
import { AudioSfxService } from '../../services/audio-sfx.service';
import { ThemeService } from '../../services/theme.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30 transition-colors">
      
      <!-- Top Brand Logo -->
      <div>
        <div class="p-5 flex items-center gap-3 border-b border-slate-200 dark:border-zinc-800/80">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
            P
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">PolyglotStudio</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                PRO
              </span>
            </div>
            <span class="text-[10px] font-medium text-slate-500 dark:text-zinc-400">Language Acquisition OS</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="p-3 space-y-1">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">📊</span>
            <span>Dashboard & Analytics</span>
          </a>

          <a
            routerLink="/curriculum"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">🗺️</span>
            <span>Curriculum Roadmap</span>
          </a>

          <a
            routerLink="/studio"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">🎙️</span>
            <span>Interactive Studio</span>
          </a>

          <a
            routerLink="/vocabulary"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">📚</span>
            <span>Vocabulary Vault</span>
          </a>

          <a
            routerLink="/phonetics"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">🔬</span>
            <span>Phonetics & IPA Lab</span>
          </a>

          <a
            routerLink="/grammar"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">🧩</span>
            <span>Grammar Matrix</span>
          </a>

          <a
            routerLink="/roleplay"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">🎭</span>
            <span>AI Dialogue Arena</span>
          </a>

          <a
            routerLink="/leaderboard"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">🏆</span>
            <span>Diamond League</span>
          </a>

          <a
            routerLink="/settings"
            routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-500/15 dark:text-white"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all group font-medium"
          >
            <span class="text-base group-hover:scale-105 transition-transform">⚙️</span>
            <span>Settings & Backend</span>
          </a>
        </nav>
      </div>

      <!-- Bottom Profile Card -->
      <div class="p-4 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/50">
        <!-- Level & XP Bar -->
        <div class="mb-3">
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Level {{ progress.level() }}</span>
              <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Senior Scholar</span>
            </span>
            <span class="text-[10px] font-mono text-slate-500 dark:text-zinc-400">{{ progress.xp() }} XP</span>
          </div>

          <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              class="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
              [style.width.%]="progress.levelProgressPercent()"
            ></div>
          </div>
        </div>

        <!-- Quick Stats Pill (Streak & Sound FX) -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800/60 text-xs">
          <div class="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-mono font-bold" title="Daily study streak">
            <span>🔥</span>
            <span>{{ progress.streak() }}d Streak</span>
          </div>

          <button
            (click)="sfx.toggleSound()"
            class="px-2 py-0.5 rounded-lg border text-[11px] font-mono transition-colors"
            [ngClass]="sfx.soundEnabled() ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-600/20 dark:border-indigo-500/30 dark:text-indigo-300' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-500'"
            title="Toggle Web Audio SFX"
          >
            {{ sfx.soundEnabled() ? '🔊 Audio SFX' : '🔇 Muted' }}
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  public progress = inject(UserProgressService);
  public sfx = inject(AudioSfxService);
  public themeService = inject(ThemeService);
  public langService = inject(LanguageService);
}
