import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { VocabularyService, ComprehensiveVocabCard, VOCABULARY_CATEGORIES } from '../../core/services/vocabulary.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { ToastService } from '../../core/services/toast.service';
import { RtlDirectionDirective } from '../../shared/directives/rtl-direction.directive';

@Component({
  selector: 'app-vocabulary-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, RtlDirectionDirective, RouterModule],
  template: `
    <div class="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      <!-- Top Navigation & Breadcrumbs -->
      <div class="flex items-center justify-between text-xs">
        <a
          routerLink="/grammar"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Grammar Matrix</span>
        </a>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 dark:text-zinc-500 font-mono text-[11px]">Next Module:</span>
          <a
            [routerLink]="['/learn', langService.selectedLanguage().id]"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-semibold transition-colors"
          >
            <span>Travel Phrasebook</span>
            <span>→</span>
          </a>
        </div>
      </div>

      <!-- Vault Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
              {{ langService.selectedLanguage().name }} Lexicon Repository
            </span>
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Categorized Vocabulary Vault
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Browse, inspect, and practice {{ currentCards().length }} high-yield terms across thematic domains governed by the SuperMemo SM-2 spaced repetition engine.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Slow Mode Toggle -->
          <button
            (click)="toggleSlow()"
            class="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            [ngClass]="tts.isSlow()
              ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400/40'
              : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50'"
            title="Toggle slow pronunciation"
          >
            <span>🐢</span>
            <span>Slow</span>
          </button>

          <!-- Flashcard Practice Toggle -->
          <button
            (click)="startFlashcardPractice()"
            class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span>🎴</span>
            <span>Flashcard Mode</span>
          </button>

          <button
            (click)="exportDeck()"
            class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-semibold text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <span>💾</span>
            <span>Export</span>
          </button>

          <button
            (click)="showAddModal.set(true)"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add Card</span>
          </button>
        </div>
      </div>

      <!-- Categories Navigation Carousel -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800">
        <button
          *ngFor="let cat of categories"
          (click)="activeCategory.set(cat)"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
          [ngClass]="activeCategory() === cat
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="surface-card p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div class="relative w-full sm:w-80">
          <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-zinc-500">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search word, phonetic, or translation..."
            class="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <!-- POS Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            *ngFor="let filter of posFilters"
            (click)="activeFilter = filter"
            class="px-3 py-1 rounded-lg text-xs font-mono transition-all border whitespace-nowrap"
            [ngClass]="activeFilter === filter ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:text-slate-900 dark:hover:text-white'"
          >
            {{ filter }}
          </button>
        </div>
      </div>

      <!-- Vocabulary Table Card -->
      <div class="surface-card rounded-2xl overflow-hidden transition-colors">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-mono uppercase text-[10px]">
              <tr>
                <th class="p-4">Target Term</th>
                <th class="p-4">Phonetic / IPA</th>
                <th class="p-4">Category</th>
                <th class="p-4">Part of Speech</th>
                <th class="p-4">English Meaning</th>
                <th class="p-4">Example Sentence</th>
                <th class="p-4">CEFR</th>
                <th class="p-4 text-right">Listen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800/80">
              <tr *ngFor="let card of filteredCards()" class="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors group">
                <td class="p-4">
                  <div class="flex items-center gap-2.5">
                    <button
                      (click)="speak(card.term)"
                      class="w-7 h-7 rounded-full bg-slate-100 hover:bg-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-600 text-slate-600 hover:text-white dark:text-zinc-300 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs active:scale-95"
                      title="Pronounce term"
                    >
                      ▶
                    </button>
                    <span
                      class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                      [appRtlDirection]="langService.selectedLanguage().script_direction"
                    >
                      {{ card.term }}
                    </span>
                  </div>
                </td>
                <td class="p-4 font-mono text-indigo-600 dark:text-indigo-400">
                  {{ card.phonetic }}
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                    {{ card.category }}
                  </span>
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    {{ card.pos }}
                  </span>
                </td>
                <td class="p-4 text-slate-700 dark:text-zinc-300 font-semibold">
                  {{ card.translation }}
                </td>
                <td class="p-4 text-slate-600 dark:text-zinc-400">
                  <div class="font-medium text-slate-800 dark:text-zinc-200" [appRtlDirection]="langService.selectedLanguage().script_direction">
                    {{ card.exampleSentence }}
                  </div>
                  <div class="text-[10px] text-slate-400 italic">
                    {{ card.exampleTranslation }}
                  </div>
                </td>
                <td class="p-4 font-mono font-bold text-slate-900 dark:text-zinc-200">
                  <span class="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px]">
                    {{ card.cefr }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button
                    (click)="speak(card.term)"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-mono text-xs transition-colors"
                  >
                    🔊 Play
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FLASHCARD STUDY MODAL -->
      <div *ngIf="showFlashcardModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="surface-card w-full max-w-lg rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-2xl relative">
          <button (click)="showFlashcardModal.set(false)" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center transition-colors">✕</button>

          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-mono font-bold uppercase text-purple-600 dark:text-purple-400">
              SM-2 Active Recall • {{ flashcardIndex() + 1 }} of {{ activeFlashcardDeck().length }}
            </span>
            <span class="text-xs font-mono text-slate-400">
              {{ activeFlashcardDeck()[flashcardIndex()]?.category }}
            </span>
          </div>

          <!-- Flip Card Container -->
          <div
            (click)="cardFlipped.set(!cardFlipped())"
            class="min-h-[260px] p-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-zinc-900 dark:via-zinc-950 dark:to-indigo-950/20 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm hover:shadow-md select-none relative overflow-hidden"
          >
            <!-- FRONT: Target Word -->
            <div *ngIf="!cardFlipped()" class="space-y-3 animate-fadeIn">
              <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">Target Word (Tap to Flip)</span>
              <h3 class="text-3xl font-extrabold text-slate-900 dark:text-white" [appRtlDirection]="langService.selectedLanguage().script_direction">
                {{ activeFlashcardDeck()[flashcardIndex()]?.term }}
              </h3>
              <p class="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                {{ activeFlashcardDeck()[flashcardIndex()]?.phonetic }}
              </p>
              <button
                (click)="$event.stopPropagation(); speak(activeFlashcardDeck()[flashcardIndex()].term)"
                class="mt-3 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-xs inline-flex items-center gap-1.5"
              >
                <span>🔊</span> Listen
              </button>
            </div>

            <!-- BACK: Meaning & Example -->
            <div *ngIf="cardFlipped()" class="space-y-3 animate-fadeIn">
              <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-bold">English Translation</span>
              <h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">
                {{ activeFlashcardDeck()[flashcardIndex()]?.translation }}
              </h3>
              <div class="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 text-xs">
                <p class="font-medium text-slate-800 dark:text-zinc-200" [appRtlDirection]="langService.selectedLanguage().script_direction">
                  {{ activeFlashcardDeck()[flashcardIndex()]?.exampleSentence }}
                </p>
                <p class="text-[11px] text-slate-500 italic mt-0.5">
                  {{ activeFlashcardDeck()[flashcardIndex()]?.exampleTranslation }}
                </p>
              </div>
            </div>
          </div>

          <!-- SM-2 Confidence Buttons -->
          <div class="mt-6 flex items-center justify-between gap-2">
            <button
              (click)="nextFlashcard(false)"
              class="flex-1 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition-colors"
            >
              Hard (Repeat Soon)
            </button>
            <button
              (click)="nextFlashcard(true)"
              class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Mastered (+20 XP)
            </button>
          </div>
        </div>
      </div>

      <!-- Add Card Modal -->
      <div *ngIf="showAddModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
        <div class="surface-card w-full max-w-lg rounded-2xl p-6 border border-slate-200/80 dark:border-zinc-800 shadow-2xl relative">
          <button (click)="showAddModal.set(false)" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center transition-colors">✕</button>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Custom Vocabulary Card</h3>

          <div class="space-y-3.5 mb-6 text-xs">
            <div>
              <label class="block text-slate-600 dark:text-zinc-400 font-mono uppercase mb-1 font-semibold">Target Term</label>
              <input type="text" [(ngModel)]="newTerm" placeholder="e.g. Desafío" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-slate-600 dark:text-zinc-400 font-mono uppercase mb-1 font-semibold">Phonetic Transcription (IPA)</label>
              <input type="text" [(ngModel)]="newPhonetic" placeholder="e.g. [de.saˈfi.o]" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-slate-600 dark:text-zinc-400 font-mono uppercase mb-1 font-semibold">English Translation</label>
              <input type="text" [(ngModel)]="newTranslation" placeholder="e.g. Challenge / Defiance" class="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button (click)="showAddModal.set(false)" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium border border-slate-200 dark:border-zinc-700">Cancel</button>
            <button (click)="saveNewCard()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm">Add to Vault</button>
          </div>
        </div>
      </div>

      <!-- Module Navigation Progression Stepper -->
      <div class="surface-card p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          routerLink="/grammar"
          class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700/80 text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>←</span>
          <span>Previous: Grammar Matrix</span>
        </a>

        <div class="text-center hidden md:block">
          <span class="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Pedagogical Sequence</span>
          <span class="text-xs font-medium text-slate-600 dark:text-zinc-300">Step 4 of 6 • Thematic Lexicon & Flashcards</span>
        </div>

        <a
          [routerLink]="['/learn', langService.selectedLanguage().id]"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:translate-x-0.5"
        >
          <span>Next: Travel Phrasebook</span>
          <span>→</span>
        </a>
      </div>

    </div>
  `
})
export class VocabularyVaultComponent {
  public langService = inject(LanguageService);
  private vocabService = inject(VocabularyService);
  public tts = inject(TextToSpeechService);
  private sfx = inject(AudioSfxService);
  public toast = inject(ToastService);

  public searchQuery = '';
  public activeFilter = 'All';
  public activeCategory = signal<string>('All');
  public posFilters = ['All', 'Noun', 'Verb', 'Adjective', 'Phrase', 'Number'];
  public categories = VOCABULARY_CATEGORIES;

  public showAddModal = signal<boolean>(false);
  public showFlashcardModal = signal<boolean>(false);
  public cardFlipped = signal<boolean>(false);
  public flashcardIndex = signal<number>(0);

  public newTerm = '';
  public newPhonetic = '';
  public newTranslation = '';

  public currentCards = computed(() => {
    return this.vocabService.getVocabularyForLanguage(this.langService.selectedLanguage().id);
  });

  public activeFlashcardDeck = computed(() => {
    return this.filteredCards();
  });

  public filteredCards = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const cat = this.activeCategory();
    const pos = this.activeFilter;

    return this.currentCards().filter(c => {
      const matchesSearch = !q || c.term.toLowerCase().includes(q) || c.translation.toLowerCase().includes(q) || c.phonetic.toLowerCase().includes(q);
      const matchesCategory = cat === 'All' || c.category === cat;
      const matchesPos = pos === 'All' || c.pos.toLowerCase() === pos.toLowerCase();
      return matchesSearch && matchesCategory && matchesPos;
    });
  });

  toggleSlow() {
    this.tts.toggleSlow();
    this.sfx.playCardFlip();
  }

  speak(term: string) {
    this.tts.speak(term, this.langService.selectedLanguage().locale_code);
  }

  startFlashcardPractice() {
    this.flashcardIndex.set(0);
    this.cardFlipped.set(false);
    this.showFlashcardModal.set(true);
    const first = this.activeFlashcardDeck()[0];
    if (first) {
      setTimeout(() => this.speak(first.term), 250);
    }
  }

  nextFlashcard(mastered: boolean) {
    if (mastered) {
      this.sfx.playSuccess();
      this.toast.show('Card mastered! +20 XP', 'success');
    } else {
      this.sfx.playCardFlip();
    }

    const next = this.flashcardIndex() + 1;
    if (next < this.activeFlashcardDeck().length) {
      this.flashcardIndex.set(next);
      this.cardFlipped.set(false);
      const card = this.activeFlashcardDeck()[next];
      if (card) {
        setTimeout(() => this.speak(card.term), 200);
      }
    } else {
      this.showFlashcardModal.set(false);
      this.sfx.playLevelUp();
      this.toast.show('Review session complete! Great work.', 'success');
    }
  }

  saveNewCard() {
    if (!this.newTerm.trim() || !this.newTranslation.trim()) return;
    const newCard: ComprehensiveVocabCard = {
      id: `v-${Date.now()}`,
      langId: this.langService.selectedLanguage().id,
      term: this.newTerm.trim(),
      phonetic: this.newPhonetic.trim() || '[...]',
      pos: 'Noun',
      category: 'Greetings & Courtesy',
      translation: this.newTranslation.trim(),
      exampleSentence: '',
      exampleTranslation: '',
      cefr: 'A1',
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      dueDate: new Date().toISOString().split('T')[0]
    };
    this.currentCards().unshift(newCard);
    this.showAddModal.set(false);
    this.newTerm = '';
    this.newPhonetic = '';
    this.newTranslation = '';
    this.toast.show('Custom vocabulary card added to your Vault!', 'success');
  }

  exportDeck() {
    const data = JSON.stringify(this.currentCards(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polyglot-deck-${this.langService.selectedLanguage().id}.json`;
    a.click();
    this.toast.show('Exported deck JSON successfully!', 'success');
  }
}
