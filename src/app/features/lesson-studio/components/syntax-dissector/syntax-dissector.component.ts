import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise, SyntaxToken } from '../../../../core/models/exercise.model';
import { Language } from '../../../../core/models/language.model';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { TokenCardComponent } from './token-card.component';
import { RtlDirectionDirective } from '../../../../shared/directives/rtl-direction.directive';

@Component({
  selector: 'app-syntax-dissector',
  standalone: true,
  imports: [CommonModule, TokenCardComponent, RtlDirectionDirective],
  template: `
    <div class="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <!-- Target Overview Card -->
      <div class="surface-card p-6 md:p-8 rounded-2xl relative overflow-hidden transition-colors">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Constituent Syntax Dissector
          </span>

          <div class="flex items-center gap-2">
            <!-- Mode Switcher: Dissect vs Reassemble -->
            <button
              (click)="toggleMode()"
              class="px-3 py-1 text-xs font-semibold rounded-xl border transition-all"
              [ngClass]="isReassembleMode() ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30' : 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-600/20 dark:text-indigo-300 dark:border-indigo-500/30'"
            >
              {{ isReassembleMode() ? 'Exit Puzzle Mode' : 'Scramble Puzzle Mode' }}
            </button>

            <button
              (click)="playNativeAudio()"
              class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span>Play Sentence</span>
            </button>
          </div>
        </div>

        <!-- Sentence Prompt Instruction -->
        <p class="text-xs text-slate-500 dark:text-zinc-400 mb-5">
          {{ isReassembleMode() ? 'Reassemble the tokens in grammatical order to form the target sentence.' : 'Tap any syntactic constituent to inspect POS tags, agreement rules, and lexical roots.' }}
        </p>

        <!-- DISSECT MODE: Interactive Token Stream -->
        <div
          *ngIf="!isReassembleMode()"
          [appRtlDirection]="language?.script_direction || 'ltr'"
          class="flex flex-wrap gap-2.5 items-center p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 min-h-[90px]"
          [ngClass]="getLanguageFontClass()"
        >
          <button
            *ngFor="let token of exercise.syntax_tokens"
            (click)="selectToken(token)"
            class="group relative flex flex-col items-center px-3.5 py-2 rounded-xl border transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95"
            [ngClass]="selectedToken()?.token === token.token ? 'bg-indigo-50 border-indigo-400 dark:bg-indigo-600/30 dark:border-indigo-500' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700/80 hover:border-slate-400 dark:hover:border-zinc-500'"
          >
            <!-- Word token -->
            <span class="text-base md:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              {{ token.token }}
            </span>
            <!-- POS Tag -->
            <span
              class="text-[9px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md mt-1"
              [ngClass]="getPosColorClass(token.pos)"
            >
              {{ token.pos }}
            </span>
          </button>
        </div>

        <!-- REASSEMBLE PUZZLE MODE -->
        <div *ngIf="isReassembleMode()" class="space-y-4">
          <!-- Assembled Slot Area -->
          <div
            [appRtlDirection]="language?.script_direction || 'ltr'"
            class="min-h-[70px] p-4 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-wrap gap-2 items-center"
            [ngClass]="getLanguageFontClass()"
          >
            <span *ngIf="assembledTokens().length === 0" class="text-xs text-slate-400 italic">
              Tap tokens below in sequential syntax order...
            </span>

            <button
              *ngFor="let token of assembledTokens(); let i = index"
              (click)="removeTokenFromAssembly(i)"
              class="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-sm hover:bg-rose-600 transition-all"
              title="Click to remove"
            >
              <span>{{ token.token }}</span>
              <span class="text-xs opacity-75">✕</span>
            </button>
          </div>

          <!-- Available Pool -->
          <div class="flex flex-wrap gap-2 items-center p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800">
            <button
              *ngFor="let token of availableTokens(); let i = index"
              (click)="addTokenToAssembly(token, i)"
              class="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold text-xs transition-all transform active:scale-95"
            >
              {{ token.token }}
            </button>
          </div>

          <!-- Puzzle Result Verification -->
          <div *ngIf="puzzleStatus()" class="p-3 rounded-xl border flex items-center justify-between"
            [ngClass]="puzzleStatus() === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'">
            <span class="text-xs font-semibold">
              {{ puzzleStatus() === 'success' ? '✓ Perfect Syntactic Construction!' : '✕ Word order deviates from target syntax. Try again.' }}
            </span>
            <button
              (click)="resetPuzzle()"
              class="text-xs font-mono underline hover:no-underline"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- Translation Footer -->
        <div class="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <div><span class="text-slate-400 dark:text-zinc-500">Translation:</span> {{ exercise.translation }}</div>
          <div *ngIf="exercise.phonetic_guide" class="font-phonetic text-slate-400">
            {{ exercise.phonetic_guide }}
          </div>
        </div>
      </div>

      <!-- Active Token Detail Card -->
      <app-token-card
        *ngIf="selectedToken() && !isReassembleMode()"
        [token]="selectedToken()"
        [language]="language"
        (close)="selectedToken.set(null)"
      ></app-token-card>
    </div>
  `
})
export class SyntaxDissectorComponent implements OnChanges {
  @Input({ required: true }) exercise!: Exercise;
  @Input() language?: Language;

  private ttsService = inject(TextToSpeechService);

  public selectedToken = signal<SyntaxToken | null>(null);
  public isReassembleMode = signal<boolean>(false);
  public availableTokens = signal<SyntaxToken[]>([]);
  public assembledTokens = signal<SyntaxToken[]>([]);
  public puzzleStatus = signal<'success' | 'fail' | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exercise']) {
      if (this.exercise.syntax_tokens && this.exercise.syntax_tokens.length > 0) {
        this.selectedToken.set(this.exercise.syntax_tokens[0]);
      }
      this.resetPuzzle();
    }
  }

  selectToken(token: SyntaxToken) {
    this.selectedToken.set(token);
  }

  playNativeAudio() {
    if (this.language) {
      this.ttsService.speak(this.exercise.target_text, this.language.locale_code);
    }
  }

  toggleMode() {
    this.isReassembleMode.update(v => !v);
    if (this.isReassembleMode()) {
      this.resetPuzzle();
    }
  }

  resetPuzzle() {
    if (this.exercise.syntax_tokens) {
      // Shuffle tokens for puzzle mode
      const shuffled = [...this.exercise.syntax_tokens].sort(() => Math.random() - 0.5);
      this.availableTokens.set(shuffled);
      this.assembledTokens.set([]);
      this.puzzleStatus.set(null);
    }
  }

  addTokenToAssembly(token: SyntaxToken, index: number) {
    this.assembledTokens.update(list => [...list, token]);
    this.availableTokens.update(list => list.filter((_, i) => i !== index));

    // Check if finished
    if (this.availableTokens().length === 0) {
      this.checkPuzzle();
    }
  }

  removeTokenFromAssembly(index: number) {
    const removed = this.assembledTokens()[index];
    this.assembledTokens.update(list => list.filter((_, i) => i !== index));
    this.availableTokens.update(list => [...list, removed]);
    this.puzzleStatus.set(null);
  }

  private checkPuzzle() {
    const expected = (this.exercise.syntax_tokens || []).map(t => t.token).join(' ');
    const actual = this.assembledTokens().map(t => t.token).join(' ');
    if (expected.trim() === actual.trim()) {
      this.puzzleStatus.set('success');
      this.playNativeAudio();
    } else {
      this.puzzleStatus.set('fail');
    }
  }

  getPosColorClass(pos: string): string {
    const p = pos.toLowerCase();
    switch (p) {
      case 'noun':
        return 'bg-blue-500/20 text-blue-300';
      case 'verb':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'adjective':
        return 'bg-amber-500/20 text-amber-300';
      case 'adverb':
        return 'bg-purple-500/20 text-purple-300';
      case 'particle':
        return 'bg-pink-500/20 text-pink-300';
      case 'preposition':
        return 'bg-cyan-500/20 text-cyan-300';
      case 'article':
      case 'determiner':
        return 'bg-indigo-500/20 text-indigo-300';
      case 'pronoun':
        return 'bg-violet-500/20 text-violet-300';
      default:
        return 'bg-slate-700/30 text-slate-300';
    }
  }

  getLanguageFontClass(): string {
    if (!this.language) return '';
    if (this.language.id === 'ar') return 'font-arabic text-xl';
    if (this.language.id === 'ta') return 'font-tamil text-xl';
    if (this.language.id === 'ja') return 'font-japanese text-xl';
    return '';
  }
}

