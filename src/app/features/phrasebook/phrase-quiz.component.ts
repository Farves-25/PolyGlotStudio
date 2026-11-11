import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PhraseService, Phrase, PHRASE_CATEGORIES } from '../../core/services/phrase.service';
import { SUPPORTED_LANGUAGES } from '../../core/services/language.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { UserProgressService } from '../../core/services/user-progress.service';

type QuizMode = 'audio_match' | 'word_scramble' | 'flashcard';
type Rating = 'again' | 'hard' | 'good' | 'easy';

interface QuizCard extends Phrase {
  rating?: Rating;
  userAnsweredCorrectly?: boolean;
}

@Component({
  selector: 'app-phrase-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-[#0C0A05] text-slate-900 dark:text-white transition-colors flex flex-col select-none">

      <!-- TOP NAV -->
      <nav class="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0C0A05]/95 backdrop-blur-sm sticky top-0 z-30">
        <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          
          <div class="flex items-center gap-3">
            <a [routerLink]="['/learn', langId(), categoryId()]"
               class="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
               title="Exit Quiz">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </a>

            <div>
              <div class="flex items-center gap-2">
                <span class="text-base">{{ categoryInfo()?.icon }}</span>
                <span class="font-extrabold text-sm text-slate-900 dark:text-white">{{ categoryInfo()?.name }}</span>
              </div>
            </div>
          </div>

          <!-- Mode Pills -->
          <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              (click)="setQuizMode('audio_match')"
              class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
              [ngClass]="currentMode() === 'audio_match' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
              title="Listen and choose matching answer"
            >
              <span>🎧</span> Ear Match
            </button>
            <button
              (click)="setQuizMode('word_scramble')"
              class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
              [ngClass]="currentMode() === 'word_scramble' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
              title="Reorder sentence tokens"
            >
              <span>🧩</span> Scramble
            </button>
            <button
              (click)="setQuizMode('flashcard')"
              class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
              [ngClass]="currentMode() === 'flashcard' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
              title="Super Memory 3D Flashcard"
            >
              <span>🧠</span> Memory
            </button>
          </div>

          <!-- Streak Flame -->
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold animate-pop">
            <span>🔥</span>
            <span>{{ comboStreak() }}x</span>
          </div>
        </div>
      </nav>

      <!-- Smooth animated progress bar -->
      <div class="h-1.5 bg-slate-200 dark:bg-slate-800 w-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300 ease-out"
          [style.width.%]="progressPercent()"
        ></div>
      </div>

      <!-- MAIN QUIZ ARENA (When not complete) -->
      <div *ngIf="!isComplete()" class="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">

        <!-- Progress Counter & Sound FX indicator -->
        <div class="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-4 px-2">
          <span>Question {{ currentIndex() + 1 }} of {{ cards().length }}</span>
          <span>Score: <strong class="text-indigo-600 dark:text-indigo-400">{{ score() }} XP</strong></span>
        </div>

        <!-- ============================================================ -->
        <!-- MODE 1: EAR MATCH (Loecsen audio listening comprehension)    -->
        <!-- ============================================================ -->
        <div *ngIf="currentMode() === 'audio_match'" class="w-full space-y-6 animate-fadeIn">
          
          <!-- Large Audio Speaker Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 text-center shadow-lg relative overflow-hidden">
            
            <div class="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-4xl mx-auto mb-4 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md group animate-pulse-glow"
                 (click)="playCurrentAudio()">
              <span>🔊</span>
            </div>

            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Listen carefully to the native phrase
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tap the speaker to replay · What does this mean in English?
            </p>

            <!-- Replay Buttons (Play + Turtle Slow) -->
            <div class="flex items-center justify-center gap-3 mt-4">
              <button
                (click)="playCurrentAudio()"
                class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-transform active:scale-95 shadow-xs flex items-center gap-1.5"
              >
                <span>▶ Play</span>
              </button>
              <button
                (click)="toggleSlow()"
                class="px-4 py-1.5 rounded-xl font-semibold text-xs border transition-all flex items-center gap-1.5 active:scale-95"
                [ngClass]="tts.isSlow()
                  ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400/50 shadow-xs font-bold scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                [attr.aria-pressed]="tts.isSlow()"
                title="Toggle slow playback (0.75x)"
              >
                <span>🐢 Slow</span>
              </button>
            </div>
          </div>

          <!-- 4 Multiple Choice Options -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              *ngFor="let opt of currentOptions(); let optIdx = index"
              (click)="selectMultipleChoice(opt)"
              [disabled]="answeredOption() !== null"
              class="p-5 rounded-2xl border text-left font-semibold text-sm transition-all transform active:scale-98 flex items-center justify-between group shadow-xs"
              [ngClass]="getOptionClass(opt)"
            >
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono flex items-center justify-center font-bold">
                  {{ ['A', 'B', 'C', 'D'][optIdx] }}
                </span>
                <span class="leading-snug">{{ opt.translation }}</span>
              </div>
              <span *ngIf="answeredOption() !== null && opt.id === currentCard()?.id" class="text-emerald-600 text-xl font-bold animate-pop">✓</span>
              <span *ngIf="answeredOption() === opt && opt.id !== currentCard()?.id" class="text-rose-600 text-xl font-bold animate-jiggle">✕</span>
            </button>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- MODE 2: WORD SCRAMBLE (Sentence Constructor)                 -->
        <!-- ============================================================ -->
        <div *ngIf="currentMode() === 'word_scramble'" class="w-full space-y-6 animate-fadeIn">
          
          <!-- Target English Prompt Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 text-center shadow-lg">
            <span class="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">
              Translate into {{ lang()?.name }}
            </span>
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
              "{{ currentCard()?.translation }}"
            </h2>
            <div class="text-xs font-mono text-slate-400">
              Phonetic clue: {{ currentCard()?.phonetic }}
            </div>
          </div>

          <!-- Assembled Sentence Drop Area -->
          <div class="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 min-h-[72px] flex flex-wrap items-center justify-center gap-2 transition-all"
               [dir]="lang()?.script_direction">
            <span *ngIf="selectedWords().length === 0" class="text-xs text-slate-400 font-medium">
              Tap word bubbles below in correct order
            </span>
            <button
              *ngFor="let token of selectedWords(); let sIdx = index"
              (click)="removeSelectedWord(sIdx)"
              class="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-xs transition-transform transform active:scale-95 animate-pop flex items-center gap-1.5"
            >
              <span>{{ token }}</span>
              <span class="text-xs opacity-60 hover:opacity-100">✕</span>
            </button>
          </div>

          <!-- Word Bank (Clickable Bubbles) -->
          <div class="flex flex-wrap items-center justify-center gap-2.5 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs"
               [dir]="lang()?.script_direction">
            <button
              *ngFor="let token of availableTokens(); let tIdx = index"
              (click)="pickWord(token, tIdx)"
              class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 font-bold text-sm transition-all transform active:scale-90 hover:shadow-xs"
            >
              {{ token }}
            </button>
          </div>

          <!-- Check Button -->
          <div class="flex items-center justify-center gap-3 pt-2">
            <button
              (click)="resetScramble()"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Reset Words
            </button>
            <button
              (click)="checkScramble()"
              [disabled]="selectedWords().length === 0"
              class="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all transform active:scale-95"
            >
              Check Answer →
            </button>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- MODE 3: FLASHCARD (Super Memory SRS)                         -->
        <!-- ============================================================ -->
        <div *ngIf="currentMode() === 'flashcard'" class="w-full space-y-6 animate-fadeIn">
          
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 text-center shadow-lg relative overflow-hidden transition-all">
            
            <!-- Question prompt -->
            <div class="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">Prompt</div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-5 leading-snug">
              "{{ currentCard()?.translation }}"
            </h2>

            <!-- Audio button -->
            <div class="flex justify-center mb-6">
              <button
                (click)="playCurrentAudio()"
                class="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 font-semibold text-xs flex items-center gap-2 transition-transform active:scale-95"
              >
                <span>🔊</span>
                <span>Listen Native Sound</span>
              </button>
            </div>

            <!-- Reveal Divider & Answer -->
            <div *ngIf="!isRevealed()">
              <button
                (click)="revealAnswer()"
                class="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
              >
                Reveal Answer (Space)
              </button>
            </div>

            <!-- Revealed Content -->
            <div *ngIf="isRevealed()" class="pt-6 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div class="text-[10px] font-mono uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                {{ lang()?.name }} Answer
              </div>
              <div
                class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 leading-snug"
                [dir]="lang()?.script_direction"
              >
                {{ currentCard()?.native }}
              </div>
              <div class="text-xs sm:text-sm font-mono text-indigo-600 dark:text-indigo-400 font-semibold mb-6">
                {{ currentCard()?.phonetic }}
              </div>

              <!-- 4 SRS Rating Buttons -->
              <div class="grid grid-cols-4 gap-2.5">
                <button
                  (click)="rateFlashcard('again')"
                  class="p-3 rounded-xl border-2 border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs hover:border-rose-400 transition-colors flex flex-col items-center gap-1"
                >
                  <span class="text-base">↩</span>
                  <span>Again (1)</span>
                </button>
                <button
                  (click)="rateFlashcard('hard')"
                  class="p-3 rounded-xl border-2 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold text-xs hover:border-orange-400 transition-colors flex flex-col items-center gap-1"
                >
                  <span class="text-base">😓</span>
                  <span>Hard (2)</span>
                </button>
                <button
                  (click)="rateFlashcard('good')"
                  class="p-3 rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs hover:border-blue-400 transition-colors flex flex-col items-center gap-1"
                >
                  <span class="text-base">👍</span>
                  <span>Good (3)</span>
                </button>
                <button
                  (click)="rateFlashcard('easy')"
                  class="p-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:border-emerald-400 transition-colors flex flex-col items-center gap-1"
                >
                  <span class="text-base">🎉</span>
                  <span>Easy (4)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ============================================================ -->
      <!-- COMPLETION SCREEN WITH ANIMATED CELEBRATION (Loecsen Style)  -->
      <!-- ============================================================ -->
      <div *ngIf="isComplete()" class="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-xl mx-auto w-full text-center animate-fadeIn">
        
        <!-- Animated celebration trophy with floating emojis -->
        <div class="relative mb-6">
          <div class="w-24 h-24 rounded-3xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 text-5xl flex items-center justify-center mx-auto shadow-xl animate-float">
            🏆
          </div>
          <span class="absolute -top-2 -right-2 text-2xl animate-float-reverse">✨</span>
          <span class="absolute -bottom-2 -left-2 text-2xl animate-float">🎉</span>
        </div>

        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Lesson Mastered!
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          Outstanding work! You just practiced {{ cards().length }} expressions in {{ categoryInfo()?.name }}.
        </p>

        <!-- Metrics Bento Card -->
        <div class="w-full grid grid-cols-3 gap-3 mb-8">
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400">+{{ score() }}</div>
            <div class="text-[11px] font-mono text-slate-400 mt-1 uppercase font-semibold">XP Earned</div>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ accuracyPercent() }}%</div>
            <div class="text-[11px] font-mono text-slate-400 mt-1 uppercase font-semibold">Accuracy</div>
          </div>
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div class="text-2xl font-black text-amber-500">{{ comboStreak() }}x</div>
            <div class="text-[11px] font-mono text-slate-400 mt-1 uppercase font-semibold">Max Streak</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            (click)="restartQuiz()"
            class="w-full sm:flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
          >
            Practice Again
          </button>
          <a
            [routerLink]="['/learn', langId()]"
            class="w-full sm:flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs transition-colors"
          >
            Next Topic →
          </a>
        </div>
      </div>

    </div>
  `
})
export class PhraseQuizComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phraseService = inject(PhraseService);
  public tts = inject(TextToSpeechService);
  public sfx = inject(AudioSfxService);
  private progress = inject(UserProgressService);

  public langId = signal<string>('es');
  public categoryId = signal<string>('essentials');
  public currentMode = signal<QuizMode>('audio_match');

  public lang = computed(() => SUPPORTED_LANGUAGES.find(l => l.id === this.langId()) || SUPPORTED_LANGUAGES[0]);
  public categoryInfo = computed(() => PHRASE_CATEGORIES.find(c => c.id === this.categoryId()));

  public cards = signal<QuizCard[]>([]);
  public currentIndex = signal<number>(0);
  public isRevealed = signal<boolean>(false);
  public isComplete = signal<boolean>(false);

  public currentCard = computed(() => this.cards()[this.currentIndex()]);
  public progressPercent = computed(() =>
    this.cards().length === 0 ? 0 : ((this.currentIndex()) / this.cards().length) * 100
  );

  // Scores & streaks
  public score = signal<number>(0);
  public comboStreak = signal<number>(0);
  public correctAnswers = signal<number>(0);
  public accuracyPercent = computed(() => {
    const total = this.cards().length;
    return total === 0 ? 0 : Math.round((this.correctAnswers() / total) * 100);
  });

  // Mode 1: Multiple choice
  public currentOptions = signal<Phrase[]>([]);
  public answeredOption = signal<Phrase | null>(null);

  // Mode 2: Word scramble
  public selectedWords = signal<string[]>([]);
  public availableTokens = signal<string[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const lId = params.get('langId');
      const cId = params.get('categoryId');
      if (lId) this.langId.set(lId);
      if (cId) this.categoryId.set(cId);
      this.initQuiz();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeydown);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeydown);
    }
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (this.currentMode() === 'flashcard') {
      if (!this.isRevealed() && e.key === ' ') {
        e.preventDefault();
        this.revealAnswer();
      } else if (this.isRevealed()) {
        if (e.key === '1') this.rateFlashcard('again');
        else if (e.key === '2') this.rateFlashcard('hard');
        else if (e.key === '3') this.rateFlashcard('good');
        else if (e.key === '4') this.rateFlashcard('easy');
      }
    }
  };

  private initQuiz() {
    const raw = this.phraseService.getPhrasesForCategory(this.langId(), this.categoryId());
    const shuffled = [...raw].sort(() => Math.random() - 0.5);
    this.cards.set(shuffled.map(p => ({ ...p })));
    this.currentIndex.set(0);
    this.score.set(0);
    this.comboStreak.set(0);
    this.correctAnswers.set(0);
    this.isComplete.set(false);
    this.setupCurrentQuestion();
  }

  public setQuizMode(mode: QuizMode) {
    this.currentMode.set(mode);
    this.setupCurrentQuestion();
  }

  private setupCurrentQuestion() {
    const card = this.currentCard();
    if (!card) return;

    this.isRevealed.set(false);
    this.answeredOption.set(null);

    if (this.currentMode() === 'audio_match') {
      // Pick 3 random distractors
      const allCategoryPhrases = this.phraseService.getPhrasesForCategory(this.langId(), this.categoryId());
      const others = allCategoryPhrases.filter(p => p.id !== card.id);
      const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [card, ...shuffledOthers].sort(() => Math.random() - 0.5);
      this.currentOptions.set(options);

      // Auto-play native audio after slight delay
      setTimeout(() => this.playCurrentAudio(), 200);
    } else if (this.currentMode() === 'word_scramble') {
      // Split native sentence into tokens
      // For languages with spaces (Spanish, French, German, Arabic, Tamil) split by space
      // For Japanese, split into characters or short segments
      const clean = card.native.replace(/[¿?¡!.,]/g, '').trim();
      let tokens = clean.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length <= 1) {
        tokens = clean.split('');
      }
      this.selectedWords.set([]);
      this.availableTokens.set([...tokens].sort(() => Math.random() - 0.5));
    }
  }

  toggleSlow(): void {
    this.tts.toggleSlow();
    this.sfx.playCardFlip();
  }

  playCurrentAudio(rate?: number) {
    const card = this.currentCard();
    if (!card) return;
    const locale = this.lang()?.locale_code || 'en-US';
    const effectiveRate = rate !== undefined ? rate : (this.tts.isSlow() ? 0.75 : 1.0);
    this.tts.speak(card.native, locale, effectiveRate);
  }

  // --- MODE 1: MULTIPLE CHOICE HANDLER ---
  selectMultipleChoice(opt: Phrase) {
    if (this.answeredOption() !== null) return;
    this.answeredOption.set(opt);

    const isCorrect = opt.id === this.currentCard()?.id;
    if (isCorrect) {
      this.sfx.playSuccess();
      this.score.update(s => s + 50 * Math.max(1, this.comboStreak()));
      this.comboStreak.update(s => s + 1);
      this.correctAnswers.update(c => c + 1);
      this.progress.addXp(50);
    } else {
      this.sfx.playError();
      this.comboStreak.set(0);
    }

    setTimeout(() => {
      this.advanceQuestion();
    }, 1200);
  }

  getOptionClass(opt: Phrase): string {
    const answered = this.answeredOption();
    if (!answered) {
      return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-800 dark:text-slate-200';
    }
    if (opt.id === this.currentCard()?.id) {
      return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-300 dark:ring-emerald-800';
    }
    if (answered === opt && opt.id !== this.currentCard()?.id) {
      return 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200';
    }
    return 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400';
  }

  // --- MODE 2: WORD SCRAMBLE HANDLER ---
  pickWord(token: string, idx: number) {
    this.sfx.playCardFlip();
    this.selectedWords.update(words => [...words, token]);
    this.availableTokens.update(tokens => tokens.filter((_, i) => i !== idx));
  }

  removeSelectedWord(idx: number) {
    this.sfx.playCardFlip();
    const removed = this.selectedWords()[idx];
    this.selectedWords.update(words => words.filter((_, i) => i !== idx));
    this.availableTokens.update(tokens => [...tokens, removed]);
  }

  resetScramble() {
    this.setupCurrentQuestion();
  }

  checkScramble() {
    const card = this.currentCard();
    if (!card) return;

    const assembled = this.selectedWords().join(' ').trim();
    const targetClean = card.native.replace(/[¿?¡!.,]/g, '').trim();

    if (assembled === targetClean || assembled.replace(/\s+/g, '') === targetClean.replace(/\s+/g, '')) {
      this.sfx.playSuccess();
      this.score.update(s => s + 75);
      this.comboStreak.update(s => s + 1);
      this.correctAnswers.update(c => c + 1);
      this.progress.addXp(75);
      setTimeout(() => this.advanceQuestion(), 600);
    } else {
      this.sfx.playError();
      this.comboStreak.set(0);
    }
  }

  // --- MODE 3: FLASHCARD HANDLER ---
  revealAnswer() {
    this.isRevealed.set(true);
    this.sfx.playCardFlip();
    this.playCurrentAudio();
  }

  rateFlashcard(rating: Rating) {
    if (rating === 'easy' || rating === 'good') {
      this.sfx.playSuccess();
      this.score.update(s => s + 50);
      this.comboStreak.update(s => s + 1);
      this.correctAnswers.update(c => c + 1);
      this.progress.addXp(50);
    } else {
      this.sfx.playError();
      this.comboStreak.set(0);
    }

    this.advanceQuestion();
  }

  private advanceQuestion() {
    if (this.currentIndex() < this.cards().length - 1) {
      this.currentIndex.update(i => i + 1);
      this.setupCurrentQuestion();
    } else {
      this.isComplete.set(true);
      this.sfx.playFanfare();
    }
  }

  restartQuiz() {
    this.initQuiz();
  }
}
