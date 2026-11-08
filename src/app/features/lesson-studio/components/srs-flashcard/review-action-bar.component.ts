import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSrsProgress } from '../../../../core/models/exercise.model';

@Component({
  selector: 'app-review-action-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-3 w-full">
      <div class="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-zinc-400 px-1">
        <span>Retrieval Difficulty (SM-2 Algorithm):</span>
        <span class="text-indigo-600 dark:text-indigo-400">Repetitions: {{ progress?.repetitions || 0 }} • Ease: {{ progress?.ease_factor || 2.5 }}</span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <!-- Again (Rating 1) -->
        <button
          (click)="rate(1)"
          class="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300 transition-all transform active:scale-95 group shadow-sm"
        >
          <span class="text-xs font-mono opacity-80">1d</span>
          <span class="text-xs font-bold mt-0.5">Again</span>
          <span class="text-[9px] opacity-70">Repeat Cycle</span>
        </button>

        <!-- Hard (Rating 3) -->
        <button
          (click)="rate(3)"
          class="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300 transition-all transform active:scale-95 group shadow-sm"
        >
          <span class="text-xs font-mono opacity-80">{{ getIntervalPreview(3) }}</span>
          <span class="text-xs font-bold mt-0.5">Hard</span>
          <span class="text-[9px] opacity-70">Pass w/ Effort</span>
        </button>

        <!-- Good (Rating 4) -->
        <button
          (click)="rate(4)"
          class="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:border-cyan-500/30 dark:text-cyan-300 transition-all transform active:scale-95 group shadow-sm"
        >
          <span class="text-xs font-mono opacity-80">{{ getIntervalPreview(4) }}</span>
          <span class="text-xs font-bold mt-0.5">Good</span>
          <span class="text-[9px] opacity-70">Ideal Cadence</span>
        </button>

        <!-- Easy (Rating 5) -->
        <button
          (click)="rate(5)"
          class="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300 transition-all transform active:scale-95 group shadow-sm"
        >
          <span class="text-xs font-mono opacity-80">{{ getIntervalPreview(5) }}</span>
          <span class="text-xs font-bold mt-0.5">Easy</span>
          <span class="text-[9px] opacity-70">Fast Retention</span>
        </button>
      </div>
    </div>
  `
})
export class ReviewActionBarComponent {
  @Input() progress?: UserSrsProgress;
  @Output() onRate = new EventEmitter<number>();

  rate(rating: number) {
    this.onRate.emit(rating);
  }

  getIntervalPreview(rating: number): string {
    const reps = this.progress?.repetitions || 0;
    const interval = this.progress?.interval_days || 1;
    const ease = this.progress?.ease_factor || 2.5;

    if (reps === 0) return '1d';
    if (reps === 1) return '6d';
    const nextDays = Math.round(interval * ease * (rating === 5 ? 1.3 : 1.0));
    return `${nextDays}d`;
  }
}

