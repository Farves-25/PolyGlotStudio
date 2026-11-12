import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SpeechVerifierComponent } from './components/speech-verifier/speech-verifier.component';
import { SyntaxDissectorComponent } from './components/syntax-dissector/syntax-dissector.component';
import { SrsFlashcardComponent } from './components/srs-flashcard/srs-flashcard.component';
import { AiRoleplayComponent } from './components/ai-roleplay/ai-roleplay.component';
import { ToastService } from '../../core/services/toast.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-lesson-runner',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SpeechVerifierComponent,
    SyntaxDissectorComponent,
    SrsFlashcardComponent,
    AiRoleplayComponent
  ],
  template: `
    <div class="w-full flex flex-col gap-6">

      <!-- Studio Breadcrumbs & Navigation Path -->
      <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <div class="flex items-center gap-2">
          <a routerLink="/curriculum" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors shadow-2xs font-bold">
            <span>←</span>
            <span>Curriculum Roadmap</span>
          </a>
          <span>›</span>
          <span class="text-slate-800 dark:text-zinc-200 font-extrabold truncate">{{ langService.selectedLesson().title }}</span>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <a routerLink="/vocabulary" class="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold">
            <span>Vocabulary Vault</span>
            <span>→</span>
          </a>
        </div>
      </div>

      <!-- Lesson Runner Header & Progress Bar -->
      <div class="surface-card p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <!-- Lesson Title & CEFR Level -->
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-mono font-bold">
              {{ langService.selectedLesson().cefr_level }}
            </span>
            <div>
              <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {{ langService.selectedLesson().title }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Topic: {{ langService.selectedLesson().topic }}
              </p>
            </div>
          </div>

          <!-- Lesson Navigation Controls -->
          <div class="flex items-center gap-2">
            <button
              (click)="langService.prevExercise()"
              [disabled]="langService.activeExerciseIndex() === 0"
              class="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-40 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors border border-slate-200 dark:border-zinc-700"
            >
              ← Prev
            </button>

            <span class="text-xs font-mono text-slate-500 dark:text-zinc-400 px-2 font-medium">
              {{ langService.activeExerciseIndex() + 1 }} / {{ langService.getCurrentLessonExercises().length }}
            </span>

            <button
              (click)="handleNext()"
              class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              {{ isLastExercise() ? 'Complete Lesson ★' : 'Next Step →' }}
            </button>
          </div>
        </div>

        <!-- Exercise Step Tabs Selector -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800/80">
          <button
            *ngFor="let ex of langService.getCurrentLessonExercises(); let i = index"
            (click)="langService.goToExercise(i)"
            class="p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center gap-2.5"
            [ngClass]="langService.activeExerciseIndex() === i
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-semibold ring-1 ring-indigo-500/20'
              : 'bg-slate-50/70 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'"
          >
            <span class="text-base select-none">{{ getExerciseIcon(ex.type) }}</span>
            <div class="flex flex-col overflow-hidden">
              <span class="text-xs font-medium capitalize truncate">{{ formatExerciseType(ex.type) }}</span>
              <span class="text-[10px] font-mono text-slate-500 dark:text-zinc-500">Stage 0{{ i + 1 }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Active Exercise Studio Container -->
      <div *ngIf="langService.getCurrentExercise() as currentEx" class="w-full">
        <!-- 1. Pronunciation Speech Verifier -->
        <app-speech-verifier
          *ngIf="currentEx.type === 'pronunciation'"
          [exercise]="currentEx"
          [language]="langService.selectedLanguage()"
        ></app-speech-verifier>

        <!-- 2. Syntax Dissector -->
        <app-syntax-dissector
          *ngIf="currentEx.type === 'syntax_dissector'"
          [exercise]="currentEx"
          [language]="langService.selectedLanguage()"
        ></app-syntax-dissector>

        <!-- 3. SRS Flashcard -->
        <app-srs-flashcard
          *ngIf="currentEx.type === 'srs_card'"
          [exercise]="currentEx"
          [language]="langService.selectedLanguage()"
        ></app-srs-flashcard>

        <!-- 4. AI Roleplay Dialogue -->
        <app-ai-roleplay
          *ngIf="currentEx.type === 'dialogue'"
          [exercise]="currentEx"
          [language]="langService.selectedLanguage()"
        ></app-ai-roleplay>
      </div>

      <!-- Bottom Step Progression Bar -->
      <div class="surface-card p-4 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-zinc-800 text-xs font-semibold">
        <button
          (click)="langService.prevExercise()"
          [disabled]="langService.activeExerciseIndex() === 0"
          class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Previous Step</span>
        </button>

        <span class="text-xs font-mono text-slate-400">
          Step {{ langService.activeExerciseIndex() + 1 }} of {{ langService.getCurrentLessonExercises().length }}
        </span>

        <button
          (click)="handleNext()"
          class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
        >
          <span>{{ isLastExercise() ? 'Complete Lesson ★' : 'Next Step →' }}</span>
        </button>
      </div>

      <!-- Lesson Completed Forward Navigation Card -->
      <div *ngIf="isCompleted()" class="surface-card p-6 md:p-8 rounded-3xl border-2 border-indigo-400/50 bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-5 animate-fadeIn">
        <div>
          <div class="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold mb-1">
            Lesson Finished! Where to go next:
          </div>
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white">
            Great mastery of {{ langService.selectedLesson().title }}
          </h3>
          <p class="text-xs text-slate-600 dark:text-zinc-300 mt-0.5">
            You can advance to Vocabulary Vault or choose your next lesson on the roadmap.
          </p>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <a
            routerLink="/curriculum"
            class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            ← Curriculum Roadmap
          </a>
          <a
            routerLink="/vocabulary"
            class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Vocabulary Vault →
          </a>
        </div>
      </div>
    </div>
  `
})
export class LessonRunnerComponent {
  public langService = inject(LanguageService);
  private toastService = inject(ToastService);
  public isCompleted = signal<boolean>(false);

  isLastExercise(): boolean {
    const list = this.langService.getCurrentLessonExercises();
    return this.langService.activeExerciseIndex() === list.length - 1;
  }

  handleNext() {
    if (this.isLastExercise()) {
      this.isCompleted.set(true);
      // Completed lesson celebration!
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 }
      });
      this.toastService.show(
        `Splendid! You have completed "${this.langService.selectedLesson().title}"!`,
        'success',
        4000
      );
    } else {
      this.langService.nextExercise();
    }
  }

  getExerciseIcon(type: string): string {
    switch (type) {
      case 'pronunciation':
        return '🎙️';
      case 'syntax_dissector':
        return '🧩';
      case 'srs_card':
        return '🗂️';
      case 'dialogue':
        return '💬';
      default:
        return '📝';
    }
  }

  formatExerciseType(type: string): string {
    switch (type) {
      case 'pronunciation':
        return 'Voice Match';
      case 'syntax_dissector':
        return 'Syntax Dissect';
      case 'srs_card':
        return 'SRS Recall';
      case 'dialogue':
        return 'AI Scenario';
      default:
        return type;
    }
  }
}

