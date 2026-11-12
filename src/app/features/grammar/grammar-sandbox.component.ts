import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { RtlDirectionDirective } from '../../shared/directives/rtl-direction.directive';

interface ConjugationSlot {
  pronoun: string;
  stem: string;
  ending: string;
  fullForm: string;
  translation: string;
}

@Component({
  selector: 'app-grammar-sandbox',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      <!-- Top Navigation & Breadcrumbs -->
      <div class="flex items-center justify-between text-xs">
        <a
          routerLink="/phonetics"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Phonetics</span>
        </a>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 dark:text-zinc-500 font-mono text-[11px]">Next Module:</span>
          <a
            routerLink="/roleplay"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-semibold transition-colors"
          >
            <span>Dialogue Arena</span>
            <span>→</span>
          </a>
        </div>
      </div>

      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Morphology & Syntax Engine</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Grammar Matrix & Conjugation Generator
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Explore inflections, verb conjugations, and syntactic agreements for {{ langService.selectedLanguage().name }}.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400">
            Dynamic Verb Engine
          </span>
        </div>
      </div>

      <!-- INTERACTIVE VERB CONJUGATION GENERATOR -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/80 dark:border-zinc-800/80">
          <!-- Verb Selector -->
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-xs font-mono uppercase text-slate-500 dark:text-zinc-400 font-bold">Infinitive:</span>
            <div class="flex flex-wrap items-center gap-2">
              <button
                *ngFor="let v of verbs"
                (click)="activeVerb = v"
                class="px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all"
                [ngClass]="activeVerb.lemma === v.lemma
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'"
              >
                {{ v.lemma }} ({{ v.meaning }})
              </button>
            </div>
          </div>

          <!-- Tense Selector -->
          <div class="flex items-center gap-2">
            <button
              *ngFor="let t of tenses"
              (click)="activeTense = t"
              class="px-3 py-1.5 rounded-xl text-xs font-mono transition-all border font-medium"
              [ngClass]="activeTense === t
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- Conjugation Grid (6 Pronoun Slots) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let slot of getConjugations()"
            class="p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 flex items-center justify-between group transition-all"
          >
            <div>
              <span class="text-[11px] font-mono text-slate-500 dark:text-zinc-500 block uppercase font-medium">{{ slot.pronoun }}</span>
              <div class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-0.5">
                <span class="text-slate-600 dark:text-zinc-400">{{ slot.stem }}</span><span class="text-emerald-600 dark:text-emerald-400 font-extrabold underline decoration-emerald-500/40">{{ slot.ending }}</span>
              </div>
              <span class="text-xs text-slate-500 dark:text-zinc-400">{{ slot.translation }}</span>
            </div>

            <button
              (click)="speak(slot.fullForm)"
              class="w-9 h-9 rounded-xl bg-slate-200/80 hover:bg-emerald-600 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 hover:text-white dark:hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-xs active:scale-95"
              title="Pronounce conjugated form"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <!-- SYNTACTIC CASE / PARTICLE VISUALIZER -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span>⚖️</span>
          <span>Core Case & Particle Syntactic Matrix</span>
        </h3>
        <p class="text-xs text-slate-500 dark:text-zinc-400 mb-6">
          Constituent syntax markers determine thematic roles (Subject, Direct Object, Indirect Object, Topic).
        </p>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl surface-card border border-blue-200 dark:border-blue-900/40 shadow-xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Nominative</span>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2">Subject Slot</h4>
            <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1">The primary agent executing the action. (German: der / ein; Japanese: が ga; Arabic: Marfoo' -u).</p>
          </div>

          <div class="p-4 rounded-xl surface-card border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Accusative</span>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2">Direct Object</h4>
            <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1">The patient directly receiving the verbal action. (German: den / einen; Japanese: を o; Arabic: Mansoob -a).</p>
          </div>

          <div class="p-4 rounded-xl surface-card border border-amber-200 dark:border-amber-900/40 shadow-xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Dative</span>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2">Indirect Recipient</h4>
            <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1">Beneficiary of the transaction or transfer. (German: dem / einem; Japanese: に ni; Tamil: -ukku).</p>
          </div>

          <div class="p-4 rounded-xl surface-card border border-purple-200 dark:border-purple-900/40 shadow-xs">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Genitive</span>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2">Possessive / Origin</h4>
            <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1">Relation of ownership or association. (German: des / eines; Japanese: の no; Arabic: Majroor -i).</p>
          </div>
        </div>
      </div>

      <!-- Module Navigation Progression Stepper -->
      <div class="surface-card p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          routerLink="/phonetics"
          class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700/80 text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>←</span>
          <span>Previous: Phonetics & IPA Lab</span>
        </a>

        <div class="text-center hidden md:block">
          <span class="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Pedagogical Sequence</span>
          <span class="text-xs font-medium text-slate-600 dark:text-zinc-300">Step 5 of 6 • Morphological Syntax</span>
        </div>

        <a
          routerLink="/roleplay"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:translate-x-0.5"
        >
          <span>Next: AI Dialogue Arena</span>
          <span>→</span>
        </a>
      </div>
    </div>
  `
})
export class GrammarSandboxComponent {
  public langService = inject(LanguageService);
  private tts = inject(TextToSpeechService);

  public verbs = [
    { lemma: 'Hablar', meaning: 'To speak', stem: 'Habl' },
    { lemma: 'Comer', meaning: 'To eat', stem: 'Com' },
    { lemma: 'Vivir', meaning: 'To live', stem: 'Viv' }
  ];

  public tenses = ['Present', 'Preterite (Past)', 'Future'];
  public activeVerb = this.verbs[0];
  public activeTense = 'Present';

  speak(word: string) {
    this.tts.speak(word, this.langService.selectedLanguage().locale_code);
  }

  getConjugations(): ConjugationSlot[] {
    const s = this.activeVerb.stem;
    if (this.activeTense === 'Present') {
      return [
        { pronoun: 'Yo (I)', stem: s, ending: 'o', fullForm: s + 'o', translation: 'I speak' },
        { pronoun: 'Tú (You)', stem: s, ending: 'as', fullForm: s + 'as', translation: 'You speak' },
        { pronoun: 'Él/Ella (He/She)', stem: s, ending: 'a', fullForm: s + 'a', translation: 'He/she speaks' },
        { pronoun: 'Nosotros (We)', stem: s, ending: 'amos', fullForm: s + 'amos', translation: 'We speak' },
        { pronoun: 'Vosotros (You pl.)', stem: s, ending: 'áis', fullForm: s + 'áis', translation: 'You all speak' },
        { pronoun: 'Ellos (They)', stem: s, ending: 'an', fullForm: s + 'an', translation: 'They speak' }
      ];
    } else if (this.activeTense === 'Future') {
      return [
        { pronoun: 'Yo (I)', stem: this.activeVerb.lemma, ending: 'é', fullForm: this.activeVerb.lemma + 'é', translation: 'I will speak' },
        { pronoun: 'Tú (You)', stem: this.activeVerb.lemma, ending: 'ás', fullForm: this.activeVerb.lemma + 'ás', translation: 'You will speak' },
        { pronoun: 'Él/Ella (He/She)', stem: this.activeVerb.lemma, ending: 'á', fullForm: this.activeVerb.lemma + 'á', translation: 'He/she will speak' },
        { pronoun: 'Nosotros (We)', stem: this.activeVerb.lemma, ending: 'emos', fullForm: this.activeVerb.lemma + 'emos', translation: 'We will speak' },
        { pronoun: 'Vosotros (You pl.)', stem: this.activeVerb.lemma, ending: 'éis', fullForm: this.activeVerb.lemma + 'éis', translation: 'You all will speak' },
        { pronoun: 'Ellos (They)', stem: this.activeVerb.lemma, ending: 'án', fullForm: this.activeVerb.lemma + 'án', translation: 'They will speak' }
      ];
    } else {
      return [
        { pronoun: 'Yo (I)', stem: s, ending: 'é', fullForm: s + 'é', translation: 'I spoke' },
        { pronoun: 'Tú (You)', stem: s, ending: 'aste', fullForm: s + 'aste', translation: 'You spoke' },
        { pronoun: 'Él/Ella (He/She)', stem: s, ending: 'ó', fullForm: s + 'ó', translation: 'He/she spoke' },
        { pronoun: 'Nosotros (We)', stem: s, ending: 'amos', fullForm: s + 'amos', translation: 'We spoke' },
        { pronoun: 'Vosotros (You pl.)', stem: s, ending: 'asteis', fullForm: s + 'asteis', translation: 'You all spoke' },
        { pronoun: 'Ellos (They)', stem: s, ending: 'aron', fullForm: s + 'aron', translation: 'They spoke' }
      ];
    }
  }
}
