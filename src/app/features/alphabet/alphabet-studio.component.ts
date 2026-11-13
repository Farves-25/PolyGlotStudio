import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';
import { AlphabetService, AlphabetLetter, ScriptGroup } from '../../core/services/alphabet.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { ToastService } from '../../core/services/toast.service';
import { RtlDirectionDirective } from '../../shared/directives/rtl-direction.directive';

@Component({
  selector: 'app-alphabet-studio',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RtlDirectionDirective],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-7xl mx-auto">

      <!-- Top Navigation & Breadcrumbs -->
      <div class="flex items-center justify-between text-xs">
        <a
          routerLink="/dashboard"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Dashboard</span>
        </a>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 dark:text-zinc-500 font-mono text-[11px]">Next Module:</span>
          <a
            routerLink="/phonetics"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-semibold transition-colors"
          >
            <span>Phonetics & IPA Lab</span>
            <span>→</span>
          </a>
        </div>
      </div>

      <!-- Main Header Banner -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-3xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Module 1 • Orthography & Script Foundation
            </span>
            <span *ngIf="alphabetData().writingDirection === 'rtl'" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              RTL Direction
            </span>
          </div>

          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {{ alphabetData().scriptName }}
          </h2>
          <p class="text-xs md:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            {{ alphabetData().overview }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <!-- Slow Mode Toggle -->
          <button
            (click)="toggleSlow()"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            [ngClass]="tts.isSlow()
              ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400/40'
              : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50'"
            title="Toggle slow clear acoustic articulation"
          >
            <span>🐢</span>
            <span>Slow Audio</span>
            <span *ngIf="tts.isSlow()" class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          </button>

          <!-- Audio Quiz Modal Toggle -->
          <button
            (click)="startEarQuiz()"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span>🎧</span>
            <span>Letter Ear Training</span>
          </button>
        </div>
      </div>

      <!-- Script Groups & Filters Toolbar -->
      <div class="space-y-4">
        <!-- Sub-group Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800">
          <button
            (click)="activeGroupId.set('all')"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
            [ngClass]="activeGroupId() === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'"
          >
            All Characters ({{ allLetters().length }})
          </button>

          <button
            *ngFor="let grp of alphabetData().groups"
            (click)="activeGroupId.set(grp.id)"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2"
            [ngClass]="activeGroupId() === grp.id
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'"
          >
            <span>{{ grp.title }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/10 dark:bg-white/10">
              {{ grp.letters.length }}
            </span>
          </button>
        </div>

        <!-- Search & Category Filters -->
        <div class="surface-card p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="relative w-full sm:w-80">
            <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-zinc-500 text-xs">🔍</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search letter, IPA, or example word..."
              class="w-full pl-8 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              *ngFor="let cat of ['all', 'vowel', 'consonant', 'special']"
              (click)="activeCategoryFilter.set(cat)"
              class="px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all border whitespace-nowrap"
              [ngClass]="activeCategoryFilter() === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'"
            >
              {{ cat === 'all' ? 'All Types' : cat }}
            </button>
          </div>
        </div>
      </div>

      <!-- Letter Cards Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <div
          *ngFor="let letter of filteredLetters()"
          class="surface-card p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
        >
          <!-- Category badge -->
          <div class="flex items-center justify-between mb-2 text-[10px] font-mono">
            <span class="px-1.5 py-0.5 rounded uppercase font-bold"
                  [ngClass]="letter.category === 'vowel'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : letter.category === 'special'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'">
              {{ letter.category }}
            </span>
            <span class="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{{ letter.ipa }}</span>
          </div>

          <!-- Big Glyph -->
          <div class="text-center my-2">
            <span
              class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white block group-hover:scale-110 transition-transform select-none"
              [appRtlDirection]="alphabetData().writingDirection"
            >
              {{ letter.glyph }}
            </span>
            <span class="text-xs font-semibold text-slate-500 dark:text-zinc-400 font-mono mt-1 block">
              {{ letter.name }}
            </span>
          </div>

          <!-- Arabic contextual forms strip if available -->
          <div *ngIf="letter.isolated" class="my-2 p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/80 text-[10px] font-mono text-center space-y-0.5">
            <div class="flex justify-around text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <span title="Final">ـ{{ letter.final }}</span>
              <span title="Medial">ـ{{ letter.medial }}ـ</span>
              <span title="Initial">{{ letter.initial }}ـ</span>
            </div>
            <span class="text-[9px] text-slate-400 block">End · Mid · Start</span>
          </div>

          <!-- Example word & pronunciation button -->
          <div class="pt-2 border-t border-slate-100 dark:border-zinc-800/80 mt-2">
            <div class="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 truncate" [appRtlDirection]="alphabetData().writingDirection">
              {{ letter.exampleWord }}
            </div>
            <div class="text-[10px] text-slate-500 dark:text-zinc-400 truncate mb-2.5 italic">
              {{ letter.exampleTranslation }}
            </div>

            <button
              (click)="playLetterSound(letter)"
              class="w-full py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-600 text-slate-700 hover:text-white dark:text-zinc-300 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <span>🔊</span>
              <span>Listen</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state when search yields 0 -->
      <div *ngIf="filteredLetters().length === 0" class="surface-card p-12 rounded-2xl text-center border border-slate-200 dark:border-zinc-800">
        <span class="text-4xl block mb-2">🔍</span>
        <h4 class="text-sm font-bold text-slate-800 dark:text-white">No letters found</h4>
        <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">Try another search keyword or clear filters.</p>
        <button (click)="searchQuery = ''; activeCategoryFilter.set('all')" class="mt-4 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
          Reset Filter
        </button>
      </div>

      <!-- EAR TRAINING INTERACTIVE MODAL -->
      <div *ngIf="showEarQuiz()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="surface-card w-full max-w-lg rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-2xl relative">
          <button (click)="showEarQuiz.set(false)" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center transition-colors">✕</button>

          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">🎧</span>
            <span class="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">Ear Training Challenge</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Listen & Identify the Letter
          </h3>
          <p class="text-xs text-slate-500 dark:text-zinc-400 mb-6">
            Train your ear to recognize the native articulation of {{ langService.selectedLanguage().name }}.
          </p>

          <!-- Big audio play button -->
          <div class="p-6 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 text-center mb-6">
            <button
              (click)="replayQuizTarget()"
              class="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <span>🔊</span>
              <span>Replay Letter Sound</span>
            </button>
            <span class="block text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-2">
              Score: {{ quizScore() }} / {{ quizTotal() }}
            </span>
          </div>

          <!-- 4 Multiple Choice Options -->
          <div class="grid grid-cols-2 gap-3 mb-6">
            <button
              *ngFor="let opt of quizOptions()"
              (click)="selectQuizAnswer(opt)"
              [disabled]="quizAnswered()"
              class="p-4 rounded-xl border-2 text-center transition-all select-none"
              [ngClass]="getQuizOptionClass(opt)"
            >
              <span class="text-3xl font-extrabold block mb-1" [appRtlDirection]="alphabetData().writingDirection">{{ opt.glyph }}</span>
              <span class="text-xs font-mono font-semibold text-slate-500 dark:text-zinc-400">{{ opt.name }}</span>
            </button>
          </div>

          <!-- Next Button -->
          <div *ngIf="quizAnswered()" class="flex justify-end">
            <button
              (click)="generateQuizQuestion()"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Next Letter →
            </button>
          </div>
        </div>
      </div>

      <!-- Module Navigation Progression Stepper -->
      <div class="surface-card p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          routerLink="/dashboard"
          class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700/80 text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>←</span>
          <span>Previous: Dashboard</span>
        </a>

        <div class="text-center hidden md:block">
          <span class="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Course Sequence</span>
          <span class="text-xs font-medium text-slate-600 dark:text-zinc-300">Step 1 of 6 • Alphabet & Script Foundations</span>
        </div>

        <a
          routerLink="/phonetics"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:translate-x-0.5"
        >
          <span>Next: Phonetics & IPA Lab</span>
          <span>→</span>
        </a>
      </div>

    </div>
  `
})
export class AlphabetStudioComponent {
  public langService = inject(LanguageService);
  private alphabetService = inject(AlphabetService);
  public tts = inject(TextToSpeechService);
  private sfx = inject(AudioSfxService);
  private toast = inject(ToastService);

  public activeGroupId = signal<string>('all');
  public activeCategoryFilter = signal<string>('all');
  public searchQuery = '';

  public alphabetData = computed(() => {
    return this.alphabetService.getAlphabetForLanguage(this.langService.selectedLanguage().id);
  });

  public allLetters = computed(() => {
    const data = this.alphabetData();
    const list: AlphabetLetter[] = [];
    for (const g of data.groups) {
      list.push(...g.letters);
    }
    return list;
  });

  public filteredLetters = computed(() => {
    let list = this.allLetters();
    const grp = this.activeGroupId();
    if (grp !== 'all') {
      const g = this.alphabetData().groups.find(x => x.id === grp);
      list = g ? g.letters : list;
    }

    const cat = this.activeCategoryFilter();
    if (cat !== 'all') {
      list = list.filter(l => l.category === cat);
    }

    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(l =>
        l.glyph.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.ipa.toLowerCase().includes(q) ||
        l.transliteration.toLowerCase().includes(q) ||
        l.exampleWord.toLowerCase().includes(q) ||
        l.exampleTranslation.toLowerCase().includes(q)
      );
    }

    return list;
  });

  // Ear training quiz signals
  public showEarQuiz = signal<boolean>(false);
  public quizTarget = signal<AlphabetLetter | null>(null);
  public quizOptions = signal<AlphabetLetter[]>([]);
  public quizAnswered = signal<boolean>(false);
  public selectedQuizOpt = signal<AlphabetLetter | null>(null);
  public quizScore = signal<number>(0);
  public quizTotal = signal<number>(0);

  toggleSlow() {
    this.tts.toggleSlow();
    this.sfx.playCardFlip();
  }

  playLetterSound(letter: AlphabetLetter) {
    const locale = this.langService.selectedLanguage().locale_code;
    this.tts.speak(letter.audioText || letter.glyph, locale);
    this.toast.show(`${letter.glyph} — ${letter.name} (${letter.ipa})`, 'info', 1600);
  }

  startEarQuiz() {
    this.quizScore.set(0);
    this.quizTotal.set(0);
    this.showEarQuiz.set(true);
    this.generateQuizQuestion();
  }

  generateQuizQuestion() {
    const pool = this.allLetters();
    if (pool.length < 4) return;

    // Pick 1 target and 3 distractors
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    const options = shuffled.slice(0, 4).sort(() => 0.5 - Math.random());

    this.quizTarget.set(target);
    this.quizOptions.set(options);
    this.quizAnswered.set(false);
    this.selectedQuizOpt.set(null);

    // Speak target letter
    setTimeout(() => this.replayQuizTarget(), 200);
  }

  replayQuizTarget() {
    const target = this.quizTarget();
    if (target) {
      this.tts.speak(target.audioText || target.glyph, this.langService.selectedLanguage().locale_code);
    }
  }

  selectQuizAnswer(opt: AlphabetLetter) {
    if (this.quizAnswered()) return;
    this.quizAnswered.set(true);
    this.selectedQuizOpt.set(opt);
    this.quizTotal.update(t => t + 1);

    if (opt.glyph === this.quizTarget()?.glyph) {
      this.quizScore.update(s => s + 1);
      this.sfx.playSuccess();
      this.toast.show('Correct! Great ear recognition.', 'success');
    } else {
      this.sfx.playError();
      this.toast.show(`Incorrect. Target was ${this.quizTarget()?.glyph} (${this.quizTarget()?.name})`, 'warning');
    }
  }

  getQuizOptionClass(opt: AlphabetLetter): string {
    if (!this.quizAnswered()) {
      return 'border-slate-200 dark:border-zinc-800 hover:border-indigo-500 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white';
    }
    if (opt.glyph === this.quizTarget()?.glyph) {
      return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400';
    }
    if (opt.glyph === this.selectedQuizOpt()?.glyph) {
      return 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';
    }
    return 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-400 opacity-60';
  }
}

