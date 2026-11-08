import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProgressService } from '../../core/services/user-progress.service';
import { LanguageService } from '../../core/services/language.service';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  badge: string;
  isCurrentUser?: boolean;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">💎</span>
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Competitive Tier</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Diamond League Arena
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Top 3 advance to the Global Champion tier. Resets in 2 days, 14 hours.
          </p>
        </div>

        <div class="bg-cyan-50 dark:bg-cyan-950/40 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800 text-center">
          <span class="text-[10px] font-mono text-cyan-700 dark:text-cyan-300 uppercase block font-semibold">Your Standing</span>
          <span class="text-xl font-bold text-cyan-800 dark:text-cyan-300">#4 • {{ progress.xp() }} XP</span>
        </div>
      </div>

      <!-- Leaderboard List -->
      <div class="surface-card rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-zinc-800/80">
        
        <div
          *ngFor="let u of users"
          class="p-4 sm:p-5 flex items-center justify-between transition-all"
          [ngClass]="u.isCurrentUser ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-indigo-600' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'"
        >
          <!-- Left: Rank & Avatar & Name -->
          <div class="flex items-center gap-4">
            <!-- Rank Badge -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-sm shrink-0"
              [ngClass]="getRankBadgeClass(u.rank)"
            >
              {{ u.rank }}
            </div>

            <div class="text-2xl select-none">{{ u.avatar }}</div>

            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900 dark:text-white text-sm" [class.text-indigo-600]="u.isCurrentUser" [class.dark:text-indigo-300]="u.isCurrentUser">
                  {{ u.name }}
                </span>
                <span *ngIf="u.isCurrentUser" class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 uppercase">
                  You
                </span>
                <span class="text-xs">{{ u.badge }}</span>
              </div>
              <span class="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                🔥 {{ u.streak }} day streak
              </span>
            </div>
          </div>

          <!-- Right: XP Score -->
          <div class="text-right">
            <span class="text-base font-bold text-slate-900 dark:text-white font-mono block">{{ u.xp }}</span>
            <span class="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">XP Earned</span>
          </div>
        </div>
      </div>

      <!-- Promotion & Demotion Info -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl surface-card border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-3 shadow-xs">
          <span class="text-2xl">🚀</span>
          <div class="text-xs">
            <strong class="text-emerald-700 dark:text-emerald-300 block font-semibold">Promotion Zone (Top 3)</strong>
            <span class="text-slate-500 dark:text-zinc-400">Advances to Grandmaster Obsidian League.</span>
          </div>
        </div>

        <div class="p-4 rounded-xl surface-card border border-rose-200 dark:border-rose-900/40 flex items-center gap-3 shadow-xs">
          <span class="text-2xl">⚠️</span>
          <div class="text-xs">
            <strong class="text-rose-700 dark:text-rose-300 block font-semibold">Demotion Zone (Bottom 5)</strong>
            <span class="text-slate-500 dark:text-zinc-400">Drops down to Emerald Tier at week end.</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LeaderboardComponent {
  public progress = inject(UserProgressService);
  public langService = inject(LanguageService);

  public users: LeaderboardUser[] = [
    { rank: 1, name: 'Elena Rostova', avatar: '👩‍🔬', xp: 2180, streak: 42, badge: '👑' },
    { rank: 2, name: 'Kenji Takahashi', avatar: '👨‍💻', xp: 1950, streak: 28, badge: '⚡' },
    { rank: 3, name: 'Sophia Al-Mansoor', avatar: '👩‍💼', xp: 1640, streak: 19, badge: '🌟' },
    { rank: 4, name: 'You (Senior Polyglot)', avatar: '🧑‍🚀', xp: 1420, streak: 12, badge: '🔥', isCurrentUser: true },
    { rank: 5, name: 'Mateo Hernández', avatar: '👨‍🎨', xp: 1290, streak: 9, badge: '🎯' },
    { rank: 6, name: 'Ananya Raman', avatar: '👩‍🏫', xp: 1110, streak: 14, badge: '📚' },
    { rank: 7, name: 'Lucas Dubois', avatar: '👨‍🍳', xp: 880, streak: 5, badge: '🥐' }
  ];

  getRankBadgeClass(rank: number): string {
    switch (rank) {
      case 1:
        return 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-xs font-bold';
      case 2:
        return 'bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 ring-2 ring-slate-300 dark:ring-zinc-600 font-bold';
      case 3:
        return 'bg-amber-700 text-white ring-2 ring-amber-600 font-bold';
      default:
        return 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold';
    }
  }
}

