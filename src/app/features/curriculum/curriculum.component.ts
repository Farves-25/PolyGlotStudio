import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { Lesson } from '../../core/models/language.model';
import { RtlDirectionDirective } from '../../shared/directives/rtl-direction.directive';

interface CurriculumUnit {
  unitNumber: number;
  title: string;
  cefr: string;
  themeColor: string;
  lessons: {
    id: string;
    title: string;
    topic: string;
    icon: string;
    status: 'completed' | 'active' | 'locked';
    score?: number;
  }[];
}

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
              {{ langService.selectedLanguage().name }} Learning Path
            </span>
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Curriculum Roadmap
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Sequenced pedagogical milestones from foundational phonology to full conversational fluency.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <a
            routerLink="/dashboard"
            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Dashboard</span>
          </a>
          <a
            routerLink="/studio"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Enter Studio</span>
            <span>→</span>
          </a>
        </div>
      </div>

      <!-- Roadmap Tree Units -->
      <div class="space-y-10 py-4">
        <div *ngFor="let unit of units; let uIdx = index" class="relative">
          
          <!-- Unit Header Card -->
          <div class="surface-card p-5 rounded-2xl mb-8 flex items-center justify-between transition-colors">
            <div class="flex items-center gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center font-black text-sm text-indigo-600 dark:text-indigo-400">
                U{{ unit.unitNumber }}
              </div>
              <div>
                <span class="text-[10px] font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold tracking-wider">
                  CEFR {{ unit.cefr }} Milestone
                </span>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ unit.title }}</h3>
              </div>
            </div>

            <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
              {{ getUnitProgress(unit) }}
            </span>
          </div>

          <!-- Nodes Connected Path -->
          <div class="flex flex-col items-center gap-6 relative">
            <div
              *ngFor="let lesson of unit.lessons; let lIdx = index"
              class="relative flex flex-col items-center"
            >
              <!-- Connecting vertical line -->
              <div *ngIf="lIdx > 0" class="w-0.5 h-6 bg-slate-300 dark:bg-zinc-800 -mt-6 mb-2 rounded-full"></div>

              <!-- Node Circle -->
              <button
                (click)="startLesson(lesson.id)"
                [disabled]="lesson.status === 'locked'"
                class="group relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-md"
                [ngClass]="getNodeClasses(lesson.status)"
              >
                <!-- Pulse ring on active node -->
                <div
                  *ngIf="lesson.status === 'active'"
                  class="absolute -inset-1.5 rounded-full bg-indigo-500/20 animate-pulse pointer-events-none"
                ></div>

                <span class="text-xl select-none group-hover:scale-110 transition-transform">
                  {{ lesson.icon }}
                </span>

                <!-- Completed Checkmark or Lock badge -->
                <span
                  *ngIf="lesson.status === 'completed'"
                  class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shadow-sm border border-white dark:border-zinc-900"
                >
                  ✓
                </span>
                <span
                  *ngIf="lesson.status === 'locked'"
                  class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-500 text-[10px] flex items-center justify-center border border-white dark:border-zinc-900"
                >
                  🔒
                </span>
              </button>

              <!-- Node Title & Topic -->
              <div class="mt-2 text-center max-w-[200px]">
                <h4 class="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {{ lesson.title }}
                </h4>
                <span class="text-[10px] font-mono text-slate-500 dark:text-zinc-500 block">{{ lesson.topic }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Module Progression Bar -->
      <div class="surface-card p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 class="text-[10px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400">Step 2 of Your Journey</h4>
          <div class="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">Ready to practice acoustic verifications?</div>
        </div>
        <div class="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            routerLink="/dashboard"
            class="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ← Back to Dashboard
          </a>
          <a
            routerLink="/studio"
            class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            Open Interactive Studio →
          </a>
        </div>
      </div>
    </div>
  `
})
export class CurriculumComponent {
  public langService = inject(LanguageService);
  private router = inject(Router);

  public units: CurriculumUnit[] = [
    {
      unitNumber: 1,
      title: 'Acoustic Phonetics & Core Introductions',
      cefr: 'A1',
      themeColor: 'indigo',
      lessons: [
        {
          id: 'les-1-1',
          title: 'Essential Greetings',
          topic: 'Voice Match & Intonation',
          icon: '🎙️',
          status: 'completed',
          score: 96
        },
        {
          id: 'les-1-2',
          title: 'Pronouns & Verb Stems',
          topic: 'Constituent Syntax Dissector',
          icon: '🧩',
          status: 'completed',
          score: 88
        },
        {
          id: 'les-1-3',
          title: 'Everyday Politeness',
          topic: 'Spaced Recall (SM-2)',
          icon: '🗂️',
          status: 'active'
        }
      ]
    },
    {
      unitNumber: 2,
      title: 'Cafe Culture, Social Etiquette & Navigation',
      cefr: 'A2',
      themeColor: 'emerald',
      lessons: [
        {
          id: 'les-2-1',
          title: 'Ordering at a Traditional Cafe',
          topic: 'Interactive AI Scenario',
          icon: '☕',
          status: 'active'
        },
        {
          id: 'les-2-2',
          title: 'Directions & Urban Geography',
          topic: 'Prepositional & Case Markers',
          icon: '🗺️',
          status: 'locked'
        },
        {
          id: 'les-2-3',
          title: 'Time & Numerical Systems',
          topic: 'Acoustic Ear Check',
          icon: '⏰',
          status: 'locked'
        }
      ]
    },
    {
      unitNumber: 3,
      title: 'Professional Discourse & Technical Negotiations',
      cefr: 'B1',
      themeColor: 'purple',
      lessons: [
        {
          id: 'les-3-1',
          title: 'Technical Job Interview',
          topic: 'Contextual AI Roleplay',
          icon: '💼',
          status: 'locked'
        },
        {
          id: 'les-3-2',
          title: 'Complex Hypotheticals & Subjunctive',
          topic: 'Syntax Tree Graph',
          icon: '🔬',
          status: 'locked'
        }
      ]
    }
  ];

  getNodeClasses(status: 'completed' | 'active' | 'locked'): string {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300';
      case 'active':
        return 'bg-indigo-600 text-white border-2 border-indigo-400 dark:border-indigo-300 shadow-sm';
      case 'locked':
      default:
        return 'bg-slate-100 dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 opacity-60 cursor-not-allowed';
    }
  }

  getUnitProgress(unit: CurriculumUnit): string {
    const done = unit.lessons.filter(l => l.status === 'completed').length;
    return `${done} / ${unit.lessons.length} Completed`;
  }

  startLesson(lessonId: string) {
    this.router.navigate(['/studio']);
  }
}
