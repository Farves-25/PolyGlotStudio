import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { UserProgressService } from '../../core/services/user-progress.service';
import { SRSEngineService } from '../../core/services/srs-engine.service';
import { AuthService } from '../../core/services/auth.service';
import { RtlDirectionDirective } from '../../shared/directives/rtl-direction.directive';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RtlDirectionDirective, ScrollRevealDirective],
  template: `
    <div class="space-y-7 animate-fadeIn max-w-7xl mx-auto">

      <!-- HERO BANNER -->
      <div class="relative overflow-hidden rounded-[2rem] border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white shadow-xl md:p-9" appReveal>
        <div class="pointer-events-none absolute -right-10 -top-14 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div class="pointer-events-none absolute right-8 top-6 hidden text-5xl animate-float sm:block">✨</div>
        <div class="pointer-events-none absolute bottom-6 right-28 hidden text-3xl animate-float-reverse lg:block">✈️</div>

        <div class="relative flex flex-col lg:flex-row lg:items-center justify-between gap-7">
          <div class="flex items-start gap-5">
            <div class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-3xl shadow-md select-none animate-float">
              {{ langService.selectedLanguage().flag_emoji }}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-white/20 text-white border border-white/30 uppercase tracking-wider backdrop-blur-md">
                  Target · {{ langService.selectedLanguage().name }}
                </span>
                <span *ngIf="langService.selectedLanguage().script_direction === 'rtl'" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-white/20 text-white border border-white/25">
                  Native RTL
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/15 text-indigo-100 border border-white/20">
                  {{ langService.selectedLanguage().locale_code }}
                </span>
              </div>

              <p class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-indigo-200">
                Buenos días, {{ auth.currentUser()?.name || 'Explorer' }} 👋
              </p>
              <h1 class="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-[2.7rem] md:leading-[1.02] text-white" [appRtlDirection]="langService.selectedLanguage().script_direction">
                {{ langService.selectedLanguage().native_name }}
              </h1>
              <p class="mt-1.5 max-w-xl text-xs font-semibold text-indigo-100 md:text-sm">
                {{ langService.selectedLanguage().tagline }}
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              routerLink="/studio"
              class="group px-6 py-3.5 rounded-xl bg-white text-indigo-700 hover:bg-slate-50 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95"
            >
              <span>Resume studio session</span>
              <span class="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              routerLink="/curriculum"
              class="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs border border-white/25 backdrop-blur-md flex items-center justify-center transition-colors"
            >
              Curriculum roadmap
            </a>
          </div>
        </div>

        <!-- Daily mini stats -->
        <div class="relative mt-7 grid grid-cols-2 gap-2 border-t border-white/20 pt-5 sm:grid-cols-4">
          <div class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/15 border border-white/20 text-base">🔥</span>
            <div><div class="font-display text-lg font-extrabold leading-none text-white">{{ progress.streak() }} days</div><div class="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Streak</div></div>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/15 border border-white/20 text-base">⏱️</span>
            <div><div class="font-display text-lg font-extrabold leading-none text-white">{{ progress.minutesToday() }}/{{ progress.dailyGoalMinutes() }}m</div><div class="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Today</div></div>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/15 border border-white/20 text-base">🗂️</span>
            <div><div class="font-display text-lg font-extrabold leading-none text-white">{{ srs.getDueReviewCount() }} cards</div><div class="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Due review</div></div>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/15 border border-white/20 text-base">💎</span>
            <div><div class="font-display text-lg font-extrabold leading-none text-white">{{ progress.gems() }} gems</div><div class="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Collected</div></div>
          </div>
        </div>
      </div>

      <!-- METRICS GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Competency -->
        <div class="surface-card p-6 rounded-2xl flex flex-col justify-between" appReveal>
          <div>
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-display text-base font-extrabold text-stone-900 dark:text-stone-100">
                Competency breakdown
              </h3>
              <span class="text-[10px] font-mono text-sun-700 dark:text-sun-300 font-extrabold rounded-full bg-sun-100 dark:bg-sun-400/10 px-2 py-0.5">CEFR A1 · 74%</span>
            </div>

            <div class="space-y-4">
              <div *ngFor="let skill of skills">
                <div class="flex justify-between text-xs mb-1.5">
                  <span class="text-stone-600 dark:text-stone-400 font-semibold">{{ skill.label }}</span>
                  <span class="font-mono text-stone-900 dark:text-stone-200 font-extrabold">{{ skill.value }}%</span>
                </div>
                <div class="w-full bg-stone-900/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                  <div class="bar-grow h-full rounded-full bg-gradient-to-r from-sun-500 via-sun-400 to-orange-400" [style.width.%]="skill.value"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-stone-900/10 dark:border-sun-300/10 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Next target: <strong class="text-stone-800 dark:text-stone-200">A2 Elementary</strong></span>
            <span class="text-sun-700 dark:text-sun-300 font-mono font-bold">260 XP away</span>
          </div>
        </div>

        <!-- Heatmap -->
        <div class="surface-card p-6 rounded-2xl flex flex-col justify-between lg:col-span-2" appReveal>
          <div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 class="font-display text-base font-extrabold text-stone-900 dark:text-stone-100">
                Consistency &amp; activity
              </h3>
              <div class="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono font-bold">
                <span>Less</span>
                <span class="w-2.5 h-2.5 rounded-sm bg-stone-200 dark:bg-white/10"></span>
                <span class="w-2.5 h-2.5 rounded-sm bg-sun-200 dark:bg-sun-400/20"></span>
                <span class="w-2.5 h-2.5 rounded-sm bg-sun-400 dark:bg-sun-400/50"></span>
                <span class="w-2.5 h-2.5 rounded-sm bg-sun-600 dark:bg-sun-300"></span>
                <span>More</span>
              </div>
            </div>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">
              A continuous 12-week study cadence. {{ progress.streak() }} day active streak recorded. Tiny steps count.
            </p>

            <div class="grid grid-flow-col grid-rows-7 gap-1.5 p-3 rounded-xl bg-sun-50 dark:bg-white/[0.03] border border-stone-900/10 dark:border-sun-300/10 w-full overflow-x-auto">
              <div
                *ngFor="let day of progress.getActivityHeatmap()"
                class="w-3.5 h-3.5 rounded-sm transition-transform hover:scale-150 cursor-pointer"
                [ngClass]="getHeatmapClass(day.count)"
                [title]="day.date + ': ' + day.count + ' sessions completed'"
              ></div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-stone-900/10 dark:border-sun-300/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex flex-wrap items-center gap-4">
              <div><span class="text-stone-500 dark:text-stone-400">Today:</span> <strong class="text-stone-900 dark:text-stone-100 ml-1">{{ progress.minutesToday() }}m / {{ progress.dailyGoalMinutes() }}m</strong></div>
              <div><span class="text-stone-500 dark:text-stone-400">Streak:</span> <strong class="text-sun-700 dark:text-sun-300 ml-1">{{ progress.streak() }} days</strong></div>
              <div><span class="text-stone-500 dark:text-stone-400">Due cards:</span> <strong class="text-sun-700 dark:text-sun-300 ml-1">{{ srs.getDueReviewCount() }}</strong></div>
            </div>
            <button routerLink="/vocabulary" class="text-sun-700 dark:text-sun-300 hover:underline font-mono text-[11px] font-extrabold">
              Open vault →
            </button>
          </div>
        </div>
      </div>

      <!-- MODULES -->
      <div appReveal>
        <div class="flex items-end justify-between mb-4">
          <div>
            <h3 class="font-display text-lg font-extrabold text-stone-900 dark:text-stone-100">
              Core acquisition modules
            </h3>
            <p class="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Four playful ways to make it stick.</p>
          </div>
          <span class="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-sun-600/20 bg-sun-100 px-3 py-1 text-[10px] font-mono font-extrabold uppercase tracking-wider text-sun-800 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200">
            <span class="h-1.5 w-1.5 rounded-full bg-sun-500 animate-pulse"></span> All engines warm
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            *ngFor="let module of modules; let i = index"
            [routerLink]="module.link"
            class="group relative overflow-hidden surface-card p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-stone-950 hover:shadow-[6px_6px_0_0_#FFD21E] dark:hover:border-sun-300/50 dark:hover:shadow-[6px_6px_0_0_rgba(255,210,30,0.7)] flex flex-col justify-between"
          >
            <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sun-200/40 blur-2xl transition-all duration-500 group-hover:scale-150 dark:bg-sun-400/10"></div>
            <div class="relative">
              <div class="w-11 h-11 rounded-xl border-2 flex items-center justify-center text-lg mb-3 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" [ngClass]="module.iconClass">
                {{ module.icon }}
              </div>
              <h4 class="font-display text-sm font-extrabold text-stone-900 dark:text-stone-100 transition-colors group-hover:text-sun-700 dark:group-hover:text-sun-300">{{ module.title }}</h4>
              <p class="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">{{ module.description }}</p>
            </div>
            <span class="relative inline-flex items-center gap-1 mt-4 text-[10px] font-mono font-extrabold uppercase tracking-wider text-sun-700 dark:text-sun-300 transition-all group-hover:gap-2">
              {{ module.cta }} <span>→</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  public langService = inject(LanguageService);
  public progress = inject(UserProgressService);
  public srs = inject(SRSEngineService);
  public auth = inject(AuthService);

  public skills = [
    { label: 'Acoustic phonetics', value: 88 },
    { label: 'Constituent syntax', value: 76 },
    { label: 'Lexical recall (SM-2)', value: 82 },
    { label: 'Contextual dialogue', value: 65 },
  ];

  public modules = [
    { title: 'Alphabet & Script', description: 'Letters, native phonics, and acoustic ear training recognition.', cta: 'Master script', icon: '🔤', link: '/alphabet', iconClass: 'bg-indigo-100 border-indigo-600/25 text-indigo-800 dark:bg-indigo-400/10 dark:border-indigo-300/20 dark:text-indigo-300' },
    { title: 'Course Roadmap', description: '6-stage structured curriculum from phonics to conversational mastery.', cta: 'View curriculum', icon: '🗺️', link: '/curriculum', iconClass: 'bg-sun-100 border-sun-600/25 text-sun-800 dark:bg-sun-400/10 dark:border-sun-300/20 dark:text-sun-300' },
    { title: 'Syntax & Conjugation', description: 'Language typology, word order, and interactive verb matrices.', cta: 'Open matrix', icon: '🧩', link: '/grammar', iconClass: 'bg-orange-100 border-orange-600/25 text-orange-800 dark:bg-orange-400/10 dark:border-orange-300/20 dark:text-orange-300' },
    { title: 'SM-2 Spaced Recall', description: 'Thematic vocabulary decks governed by the SuperMemo SM-2 engine.', cta: 'Review cards', icon: '📚', link: '/vocabulary', iconClass: 'bg-emerald-100 border-emerald-600/25 text-emerald-800 dark:bg-emerald-400/10 dark:border-emerald-300/20 dark:text-emerald-300' },
  ];

  getHeatmapClass(count: number): string {
    switch (count) {
      case 0:
        return 'bg-stone-200 dark:bg-white/10';
      case 1:
        return 'bg-sun-200 dark:bg-sun-400/20';
      case 2:
        return 'bg-sun-300 dark:bg-sun-400/40';
      case 3:
        return 'bg-sun-500 dark:bg-sun-400/70';
      case 4:
      default:
        return 'bg-sun-700 dark:bg-sun-300';
    }
  }
}
