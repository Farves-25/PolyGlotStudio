import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { ToastService } from '../../core/services/toast.service';
import { RtlDirectionDirective } from '../../shared/directives/rtl-direction.directive';

export interface VocabCard {
  id: string;
  term: string;
  phonetic: string;
  pos: string;
  translation: string;
  exampleSentence: string;
  cefr: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;
}

@Component({
  selector: 'app-vocabulary-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, RtlDirectionDirective],
  template: `
    <div class="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      
      <!-- Vault Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">Lexicon Repository</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Vocabulary Vault
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Browse, inspect, and manage {{ cards().length }} stored lexical items governed by the SuperMemo SM-2 engine.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            (click)="exportDeck()"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-semibold text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <span>💾</span>
            <span>Export Deck</span>
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

      <!-- Search & Filters Toolbar -->
      <div class="surface-card p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
        <div class="relative w-full sm:w-80">
          <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 dark:text-zinc-500">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search word or meaning..."
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
                <th class="p-4">Phonetic IPA</th>
                <th class="p-4">Part of Speech</th>
                <th class="p-4">English Meaning</th>
                <th class="p-4">SM-2 Interval</th>
                <th class="p-4">Ease Factor</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800/80">
              <tr *ngFor="let card of filteredCards()" class="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors group">
                <td class="p-4">
                  <div class="flex items-center gap-2.5">
                    <button
                      (click)="speak(card.term)"
                      class="w-6 h-6 rounded-full bg-slate-100 hover:bg-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-600 text-slate-600 hover:text-white dark:text-zinc-300 dark:hover:text-white flex items-center justify-center transition-colors"
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
                <td class="p-4 font-phonetic text-indigo-600 dark:text-indigo-400">
                  {{ card.phonetic }}
                </td>
                <td class="p-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    {{ card.pos }}
                  </span>
                </td>
                <td class="p-4 text-slate-700 dark:text-zinc-300 font-medium">
                  {{ card.translation }}
                </td>
                <td class="p-4 font-mono text-slate-900 dark:text-zinc-200">
                  {{ card.intervalDays }} Days ({{ card.repetitions }} reps)
                </td>
                <td class="p-4 font-mono text-slate-500 dark:text-zinc-400">
                  {{ card.easeFactor }}
                </td>
                <td class="p-4 text-right">
                  <button
                    (click)="toast.show('Review tested for ' + card.term, 'info')"
                    class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-mono transition-colors border border-slate-200 dark:border-zinc-700"
                  >
                    Quick Test
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
    </div>
  `
})
export class VocabularyVaultComponent {
  public langService = inject(LanguageService);
  private tts = inject(TextToSpeechService);
  public toast = inject(ToastService);

  public searchQuery = '';
  public activeFilter = 'All';
  public posFilters = ['All', 'Noun', 'Verb', 'Adjective', 'Particle', 'Preposition'];
  public showAddModal = signal<boolean>(false);

  public newTerm = '';
  public newPhonetic = '';
  public newTranslation = '';

  public cards = signal<VocabCard[]>([
    {
      id: 'v1',
      term: 'Buenos días',
      phonetic: '[ˈbwe.nos ˈði.as]',
      pos: 'Noun',
      translation: 'Good morning',
      exampleSentence: 'Buenos días a todos.',
      cefr: 'A1',
      easeFactor: 2.6,
      intervalDays: 14,
      repetitions: 4,
      dueDate: '2026-11-20'
    },
    {
      id: 'v2',
      term: 'Plácidamente',
      phonetic: '[pla.si.ðaˈmen.te]',
      pos: 'Adverb',
      translation: 'Peacefully / calmly',
      exampleSentence: 'El gato duerme plácidamente.',
      cefr: 'B1',
      easeFactor: 2.4,
      intervalDays: 6,
      repetitions: 2,
      dueDate: '2026-11-12'
    },
    {
      id: 'v3',
      term: 'Agradecimiento',
      phonetic: '[a.ɣɾa.ðe.siˈmjen.to]',
      pos: 'Noun',
      translation: 'Gratitude / appreciation',
      exampleSentence: 'Con sincero agradecimiento.',
      cefr: 'B2',
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      dueDate: '2026-11-07'
    },
    {
      id: 'v4',
      term: 'Desarrollador',
      phonetic: '[de.sa.ro.ʝaˈðoɾ]',
      pos: 'Noun',
      translation: 'Software developer',
      exampleSentence: 'Soy desarrollador frontend en Angular.',
      cefr: 'B1',
      easeFactor: 2.7,
      intervalDays: 21,
      repetitions: 5,
      dueDate: '2026-11-28'
    }
  ]);

  speak(term: string) {
    this.tts.speak(term, this.langService.selectedLanguage().locale_code);
  }

  filteredCards(): VocabCard[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.cards().filter(c => {
      const matchesSearch = !q || c.term.toLowerCase().includes(q) || c.translation.toLowerCase().includes(q);
      const matchesFilter = this.activeFilter === 'All' || c.pos.toLowerCase() === this.activeFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }

  saveNewCard() {
    if (!this.newTerm.trim() || !this.newTranslation.trim()) return;
    const newCard: VocabCard = {
      id: `v-${Date.now()}`,
      term: this.newTerm.trim(),
      phonetic: this.newPhonetic.trim() || '[...]',
      pos: 'Noun',
      translation: this.newTranslation.trim(),
      exampleSentence: '',
      cefr: 'A1',
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      dueDate: new Date().toISOString().split('T')[0]
    };
    this.cards.update(list => [newCard, ...list]);
    this.showAddModal.set(false);
    this.newTerm = '';
    this.newPhonetic = '';
    this.newTranslation = '';
    this.toast.show('Custom vocabulary card added to your Vault!', 'success');
  }

  exportDeck() {
    const data = JSON.stringify(this.cards(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polyglot-deck-${this.langService.selectedLanguage().id}.json`;
    a.click();
    this.toast.show('Exported deck JSON successfully!', 'success');
  }
}

