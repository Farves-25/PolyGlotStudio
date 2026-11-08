import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise, UserSrsProgress } from '../../../../core/models/exercise.model';
import { Language } from '../../../../core/models/language.model';
import { SRSEngineService } from '../../../../core/services/srs-engine.service';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ReviewActionBarComponent } from './review-action-bar.component';
import { RtlDirectionDirective } from '../../../../shared/directives/rtl-direction.directive';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-srs-flashcard',
  standalone: true,
  imports: [CommonModule, ReviewActionBarComponent, RtlDirectionDirective],
  template: `
    <div class="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <!-- 3D Card Container -->
      <div class="perspective-1000 w-full min-h-[340px] cursor-pointer select-none" (click)="toggleFlip()">
        <div
          class="relative w-full h-full min-h-[340px] rounded-3xl transition-transform duration-700 transform-style-3d shadow-2xl"
          [class.rotate-y-180]="isFlipped()"
        >
          <!-- CARD FRONT -->
          <div
            class="absolute inset-0 w-full h-full backface-hidden surface-card rounded-2xl p-8 flex flex-col justify-between transition-colors"
          >
            <!-- Header Tag -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                Active Recall Deck
              </span>

              <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                Prompt
              </span>
            </div>

            <!-- Front Content / Prompt -->
            <div class="text-center my-auto py-6">
              <p class="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">Meaning / Concept</p>
              <h3 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
                {{ exercise.translation || exercise.prompt }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Recall and formulate in {{ language?.name }}
              </p>
            </div>

            <!-- Footer Hint -->
            <div class="text-center text-xs text-slate-400 dark:text-zinc-500 font-mono flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Click card or press Space to reveal solution</span>
            </div>
          </div>

          <!-- CARD BACK -->
          <div
            class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 surface-card rounded-2xl p-8 flex flex-col justify-between border border-indigo-200 dark:border-indigo-500/30 transition-colors"
          >
            <!-- Header Tag -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                Target Language Solution
              </span>

              <!-- Audio Speak Button -->
              <button
                (click)="speakNative($event)"
                class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Listen</span>
              </button>
            </div>

            <!-- Back Content: Target Phrase -->
            <div class="text-center my-auto py-4">
              <div
                [appRtlDirection]="language?.script_direction || 'ltr'"
                class="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2"
                [ngClass]="getLanguageFontClass()"
              >
                {{ exercise.target_text }}
              </div>

              <!-- Phonetics -->
              <div *ngIf="exercise.phonetic_guide" class="text-sm font-phonetic text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                {{ exercise.phonetic_guide }}
              </div>

              <!-- Meaning -->
              <div class="text-xs text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                {{ exercise.translation }}
              </div>
            </div>

            <!-- Footer: Scheduled Metrics -->
            <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-zinc-500 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <span>Interval: {{ progress()?.interval_days }}d</span>
              <span>Next Due: {{ progress()?.due_date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SM-2 Spaced Repetition Grading Bar (Visible when flipped) -->
      <div *ngIf="isFlipped()" class="animate-fadeIn">
        <app-review-action-bar
          [progress]="progress()"
          (onRate)="handleReviewRating($event)"
        ></app-review-action-bar>
      </div>
    </div>
  `
})
export class SrsFlashcardComponent implements OnChanges {
  @Input({ required: true }) exercise!: Exercise;
  @Input() language?: Language;

  private srsService = inject(SRSEngineService);
  private ttsService = inject(TextToSpeechService);
  private toastService = inject(ToastService);

  public isFlipped = signal<boolean>(false);
  public progress = signal<UserSrsProgress | undefined>(undefined);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exercise']) {
      this.isFlipped.set(false);
      this.loadProgress();
    }
  }

  loadProgress() {
    const prog = this.srsService.getProgressForExercise(this.exercise.id);
    this.progress.set(prog);
  }

  toggleFlip() {
    this.isFlipped.update(v => !v);
    if (this.isFlipped()) {
      this.speakTarget();
    }
  }

  speakNative(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.speakTarget();
  }

  private speakTarget() {
    if (this.language) {
      this.ttsService.speak(this.exercise.target_text, this.language.locale_code);
    }
  }

  async handleReviewRating(rating: number) {
    const updated = await this.srsService.recordReview(this.exercise.id, rating);
    this.progress.set(updated);

    if (rating >= 4) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
      this.toastService.show(`Scheduled review for +${updated.interval_days} days!`, 'success');
    } else {
      this.toastService.show(`Review cycle repeated in 1 day.`, 'info');
    }
  }

  getLanguageFontClass(): string {
    if (!this.language) return '';
    if (this.language.id === 'ar') return 'font-arabic text-3xl leading-relaxed';
    if (this.language.id === 'ta') return 'font-tamil text-2xl leading-relaxed';
    if (this.language.id === 'ja') return 'font-japanese text-3xl';
    return '';
  }
}

