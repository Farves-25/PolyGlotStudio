import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyntaxToken } from '../../../../core/models/exercise.model';
import { Language } from '../../../../core/models/language.model';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';

@Component({
  selector: 'app-token-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="token"
      class="surface-card p-5 md:p-6 rounded-2xl relative overflow-hidden transition-colors"
    >
      <div class="flex items-start justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <!-- Token Word in Large Display -->
          <span
            class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white"
            [ngClass]="getLanguageFontClass()"
          >
            {{ token.token }}
          </span>

          <!-- Individual Token Speech Trigger -->
          <button
            (click)="speakToken()"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-600 border border-slate-200 dark:border-zinc-700 text-slate-600 hover:text-white dark:text-zinc-300 dark:hover:text-white flex items-center justify-center transition-colors"
            title="Pronounce word"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>

        <!-- POS Color Tag Badge -->
        <span
          class="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm"
          [ngClass]="getPosColorClass(token.pos)"
        >
          {{ token.pos }}
        </span>
      </div>

      <!-- Meaning / Semantics -->
      <div class="mb-3">
        <span class="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block uppercase tracking-wider mb-1">Syntactic Meaning</span>
        <div class="text-sm font-medium text-slate-800 dark:text-zinc-200">
          {{ token.meaning }}
        </div>
      </div>

      <!-- Lemma Root & Grammar Note -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
        <div *ngIf="token.root_form" class="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
          <span class="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block uppercase">Lemma / Root Form</span>
          <span class="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{{ token.root_form }}</span>
        </div>

        <div class="bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 md:col-span-1" [class.col-span-2]="!token.root_form">
          <span class="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block uppercase">Grammar Role</span>
          <span class="text-xs text-slate-600 dark:text-zinc-400">Agrees with target sentence structure and inflectional morphology.</span>
        </div>
      </div>
    </div>
  `
})
export class TokenCardComponent {
  @Input() token: SyntaxToken | null = null;
  @Input() language?: Language;
  @Output() close = new EventEmitter<void>();

  private ttsService = inject(TextToSpeechService);

  speakToken() {
    if (this.token && this.language) {
      this.ttsService.speak(this.token.token, this.language.locale_code);
    }
  }

  getPosColorClass(pos: string): string {
    const p = pos.toLowerCase();
    switch (p) {
      case 'noun':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'verb':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'adjective':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'adverb':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'particle':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'preposition':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'article':
      case 'determiner':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'pronoun':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  }

  getLanguageFontClass(): string {
    if (!this.language) return '';
    if (this.language.id === 'ar') return 'font-arabic';
    if (this.language.id === 'ta') return 'font-tamil';
    if (this.language.id === 'ja') return 'font-japanese';
    return '';
  }
}

