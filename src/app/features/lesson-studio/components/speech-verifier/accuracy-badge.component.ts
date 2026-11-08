import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accuracy-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="score !== null"
      class="inline-flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-md transition-all duration-500"
      [ngClass]="getBadgeClass()"
    >
      <!-- Circular Progress Ring Indicator -->
      <div class="relative w-10 h-10 flex items-center justify-center shrink-0">
        <svg class="w-10 h-10 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            stroke-width="3"
            class="text-white/10"
            fill="transparent"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="strokeDashoffset"
            class="transition-all duration-700 ease-out"
            fill="transparent"
          />
        </svg>
        <span class="absolute font-mono font-bold text-xs">
          {{ score }}%
        </span>
      </div>

      <!-- Detail Label -->
      <div class="flex flex-col text-left">
        <span class="text-xs uppercase font-mono tracking-wider font-bold">
          {{ getTierTitle() }}
        </span>
        <span class="text-[11px] opacity-80 leading-tight">
          {{ getTierDescription() }}
        </span>
      </div>
    </div>
  `
})
export class AccuracyBadgeComponent {
  @Input() score: number | null = null;

  public circumference = 2 * Math.PI * 16; // ~100.53

  get strokeDashoffset(): number {
    if (this.score === null) return this.circumference;
    const progress = Math.max(0, Math.min(100, this.score)) / 100;
    return this.circumference * (1 - progress);
  }

  getBadgeClass(): string {
    if (this.score === null) return '';
    if (this.score >= 90) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
    }
    if (this.score >= 75) {
      return 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30';
    }
    if (this.score >= 50) {
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
    }
    return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30';
  }

  getTierTitle(): string {
    if (this.score === null) return '';
    if (this.score >= 90) return 'Native-Level Enunciation';
    if (this.score >= 75) return 'Proficient Articulation';
    if (this.score >= 50) return 'Developing Phonology';
    return 'Phonetic Review Needed';
  }

  getTierDescription(): string {
    if (this.score === null) return '';
    if (this.score >= 90) return 'Phonemes match native target acoustic profile';
    if (this.score >= 75) return 'Clear intelligibility with minor dialect variance';
    if (this.score >= 50) return 'Key vowels and stress patterns require adjustment';
    return 'Listen closely to the audio model and repeat slowly';
  }
}

