import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { UserProgressService } from '../../core/services/user-progress.service';
import { SRSEngineService } from '../../core/services/srs-engine.service';
import { RtlDirectionDirective } from '../../shared/directives/rtl-direction.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RtlDirectionDirective],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      <!-- HERO BANNER -->
      <div class="surface-card p-6 md:p-8 rounded-2xl relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/80 dark:from-zinc-900/90 dark:via-zinc-900/90 dark:to-indigo-950/20">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="flex items-start gap-5">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-3xl shadow-xs shrink-0 select-none">
              {{ langService.selectedLanguage().flag_emoji }}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  Target: {{ langService.selectedLanguage().name }}
                </span>
                <span *ngIf="langService.selectedLanguage().script_direction === 'rtl'" class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  Native RTL
                </span>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  {{ langService.selectedLanguage().locale_code }}
                </span>
              </div>

              <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight" [appRtlDirection]="langService.selectedLanguage().script_direction">
                {{ langService.selectedLanguage().native_name }}
              </h1>
              <p class="text-xs md:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-xl">
                {{ langService.selectedLanguage().tagline }}
              </p>
            </div>
          </div>

          <!-- Quick Launch Action -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              routerLink="/studio"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <span>Resume Studio Session</span>
              <span>→</span>
            </a>
            <a
              routerLink="/curriculum"
              class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-xs border border-slate-200 dark:border-zinc-700 flex items-center justify-center transition-colors"
            >
              Curriculum Roadmap
            </a>
          </div>
        </div>
      </div>

      <!-- METRICS & RADAR GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- CEFR Competency Radar Matrix -->
        <div class="surface-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                Competency Breakdown
              </h3>
              <span class="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">CEFR A1 • 74%</span>
            </div>

            <!-- Competency Bars -->
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-slate-600 dark:text-zinc-400 font-medium">Acoustic Phonetics</span>
                  <span class="font-mono text-slate-900 dark:text-zinc-200 font-bold">88%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style="width: 88%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-slate-600 dark:text-zinc-400 font-medium">Constituent Syntax</span>
                  <span class="font-mono text-slate-900 dark:text-zinc-200 font-bold">76%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style="width: 76%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-slate-600 dark:text-zinc-400 font-medium">Lexical Recall (SM-2)</span>
                  <span class="font-mono text-slate-900 dark:text-zinc-200 font-bold">82%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style="width: 82%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-slate-600 dark:text-zinc-400 font-medium">Contextual Dialogue</span>
                  <span class="font-mono text-slate-900 dark:text-zinc-200 font-bold">65%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div class="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" style="width: 65%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Next Target: <strong class="text-slate-800 dark:text-zinc-200">A2 Elementary</strong></span>
            <span class="text-indigo-600 dark:text-indigo-400 font-mono font-medium">260 XP away</span>
          </div>
        </div>

        <!-- Daily Study Habit Heatmap (12 weeks) -->
        <div class="surface-card p-6 rounded-2xl flex flex-col justify-between lg:col-span-2">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                Consistency & Activity Calendar
              </h3>
              <div class="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span>Less</span>
                <span class="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-zinc-800"></span>
                <span class="w-2.5 h-2.5 rounded-sm bg-indigo-300 dark:bg-indigo-900"></span>
                <span class="w-2.5 h-2.5 rounded-sm bg-indigo-500 dark:bg-indigo-600"></span>
                <span class="w-2.5 h-2.5 rounded-sm bg-indigo-700 dark:bg-indigo-400"></span>
                <span>More</span>
              </div>
            </div>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Continuous 12-week study cadence. {{ progress.streak() }} day active streak recorded.
            </p>

            <!-- Heatmap Grid -->
            <div class="grid grid-flow-col grid-rows-7 gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 w-full overflow-x-auto">
              <div
                *ngFor="let day of progress.getActivityHeatmap()"
                class="w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer"
                [ngClass]="getHeatmapClass(day.count)"
                [title]="day.date + ': ' + day.count + ' sessions completed'"
              ></div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-4">
              <div><span class="text-slate-500 dark:text-zinc-400">Today:</span> <strong class="text-slate-900 dark:text-white ml-1">{{ progress.minutesToday() }}m / {{ progress.dailyGoalMinutes() }}m</strong></div>
              <div><span class="text-slate-500 dark:text-zinc-400">Streak:</span> <strong class="text-amber-600 dark:text-amber-400 ml-1">{{ progress.streak() }} Days</strong></div>
              <div><span class="text-slate-500 dark:text-zinc-400">Due Cards:</span> <strong class="text-indigo-600 dark:text-indigo-400 ml-1">{{ srs.getDueReviewCount() }} Cards</strong></div>
            </div>
            <button routerLink="/vocabulary" class="text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-[11px] font-bold">
              Open Vault →
            </button>
          </div>
        </div>
      </div>

      <!-- MODALITIES & LABS TILES -->
      <div>
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-4">
          Core Acquisition Modules
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Modality 1 -->
          <a
            routerLink="/studio"
            class="surface-card p-5 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-lg mb-3 text-indigo-600 dark:text-indigo-400 shadow-xs">
                🎙️
              </div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Acoustic Verifier</h4>
              <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">Live microphone waveform & Levenshtein accuracy distance.</p>
            </div>
            <span class="inline-flex items-center gap-1 mt-4 text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-1.5 transition-all">Launch Studio →</span>
          </a>

          <!-- Modality 2 -->
          <a
            routerLink="/grammar"
            class="surface-card p-5 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-lg mb-3 text-emerald-600 dark:text-emerald-400 shadow-xs">
                🧩
              </div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Syntax & Conjugation</h4>
              <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">POS constituents, particle mechanics, and dynamic verb matrices.</p>
            </div>
            <span class="inline-flex items-center gap-1 mt-4 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-1.5 transition-all">Open Matrix →</span>
          </a>

          <!-- Modality 3 -->
          <a
            routerLink="/vocabulary"
            class="surface-card p-5 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-lg mb-3 text-cyan-600 dark:text-cyan-400 shadow-xs">
                📚
              </div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">SM-2 Spaced Recall</h4>
              <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">3D flashcard loop governed by SuperMemo SM-2 interval engine.</p>
            </div>
            <span class="inline-flex items-center gap-1 mt-4 text-[11px] font-mono font-semibold text-cyan-600 dark:text-cyan-400 group-hover:gap-1.5 transition-all">Review Cards →</span>
          </a>

          <!-- Modality 4 -->
          <a
            routerLink="/roleplay"
            class="surface-card p-5 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-lg mb-3 text-purple-600 dark:text-purple-400 shadow-xs">
                🎭
              </div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">AI Dialogue Arena</h4>
              <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">Simulated cultural scenarios with real-time AI responses.</p>
            </div>
            <span class="inline-flex items-center gap-1 mt-4 text-[11px] font-mono font-semibold text-purple-600 dark:text-purple-400 group-hover:gap-1.5 transition-all">Enter Scenarios →</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  public langService = inject(LanguageService);
  public progress = inject(UserProgressService);
  public srs = inject(SRSEngineService);

  getHeatmapClass(count: number): string {
    switch (count) {
      case 0:
        return 'bg-slate-200 dark:bg-zinc-800';
      case 1:
        return 'bg-indigo-200 dark:bg-indigo-950';
      case 2:
        return 'bg-indigo-400 dark:bg-indigo-700';
      case 3:
        return 'bg-indigo-600 dark:bg-indigo-500';
      case 4:
      default:
        return 'bg-indigo-700 dark:bg-indigo-400';
    }
  }
}
