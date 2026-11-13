import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { RtlDirectionDirective } from '../../shared/directives/rtl-direction.directive';

interface VerbData {
  lemma: string;
  meaning: string;
  stem: string;
  conjugations: Record<string, { pronoun: string; stem: string; ending: string; fullForm: string; translation: string }[]>;
}

interface LanguageGrammarProfile {
  typology: string; // e.g. "SVO", "SOV", "V2"
  wordOrderSummary: string;
  keyRule: string;
  tenses: string[];
  verbs: VerbData[];
  rules: { title: string; tag: string; description: string; example: string }[];
}

@Component({
  selector: 'app-grammar-sandbox',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RtlDirectionDirective],
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
            routerLink="/vocabulary"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-semibold transition-colors"
          >
            <span>Vocabulary Vault</span>
            <span>→</span>
          </a>
        </div>
      </div>

      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Module 3 • Syntax & Morphology Engine
            </span>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Grammar Matrix & Conjugation Generator
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Explore inflections, verb conjugations, and sentence structure tailored for {{ langService.selectedLanguage().name }}.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400">
            Typology: {{ activeProfile().typology }}
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
                *ngFor="let v of activeProfile().verbs; let i = index"
                (click)="selectedVerbIndex.set(i)"
                class="px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all"
                [ngClass]="selectedVerbIndex() === i
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'"
              >
                <span [appRtlDirection]="langService.selectedLanguage().script_direction">{{ v.lemma }}</span> ({{ v.meaning }})
              </button>
            </div>
          </div>

          <!-- Tense Selector -->
          <div class="flex items-center gap-2">
            <button
              *ngFor="let t of activeProfile().tenses; let i = index"
              (click)="selectedTenseIndex.set(i)"
              class="px-3 py-1.5 rounded-xl text-xs font-mono transition-all border font-medium"
              [ngClass]="selectedTenseIndex() === i
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- Conjugation Slots Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let slot of currentConjugationSlots()"
            class="p-4 rounded-xl surface-subtle border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 group hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
          >
            <div>
              <span class="text-[10px] font-mono font-semibold uppercase text-slate-500 dark:text-zinc-400 block mb-0.5">
                {{ slot.pronoun }}
              </span>
              <div class="text-base font-bold text-slate-900 dark:text-white" [appRtlDirection]="langService.selectedLanguage().script_direction">
                <span class="text-slate-800 dark:text-zinc-200">{{ slot.stem }}</span>
                <span class="text-emerald-600 dark:text-emerald-400 font-black">{{ slot.ending }}</span>
              </div>
              <span class="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
                {{ slot.translation }}
              </span>
            </div>

            <button
              (click)="speak(slot.fullForm)"
              class="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-all shadow-xs active:scale-95 shrink-0"
              title="Listen to native conjugation"
            >
              🔊
            </button>
          </div>
        </div>
      </div>

      <!-- SYNTACTIC TYPOLOGY & CORE RULES CARD -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🧩</span>
              <span>Essential Syntactic Rules for {{ langService.selectedLanguage().name }}</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {{ activeProfile().wordOrderSummary }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            *ngFor="let rule of activeProfile().rules"
            class="p-4 rounded-xl surface-card border border-slate-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {{ rule.tag }}
              </span>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2">{{ rule.title }}</h4>
              <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">{{ rule.description }}</p>
            </div>
            <div class="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold" [appRtlDirection]="langService.selectedLanguage().script_direction">
              {{ rule.example }}
            </div>
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
          <span class="text-xs font-medium text-slate-600 dark:text-zinc-300">Step 3 of 6 • Morphological Syntax</span>
        </div>

        <a
          routerLink="/vocabulary"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:translate-x-0.5"
        >
          <span>Next: Vocabulary Vault</span>
          <span>→</span>
        </a>
      </div>
    </div>
  `
})
export class GrammarSandboxComponent {
  public langService = inject(LanguageService);
  private tts = inject(TextToSpeechService);

  public selectedVerbIndex = signal<number>(0);
  public selectedTenseIndex = signal<number>(0);

  private readonly GRAMMAR_PROFILES: Record<string, LanguageGrammarProfile> = {
    // ────────────────────────── SPANISH ──────────────────────────
    es: {
      typology: 'SVO (Subject - Verb - Object)',
      wordOrderSummary: 'Spanish is an SVO language with flexible subject omission (pro-drop) due to explicit verb inflection.',
      keyRule: 'Pronouns are often dropped because verb endings explicitly convey the subject.',
      tenses: ['Presente', 'Pretérito', 'Futuro'],
      verbs: [
        {
          lemma: 'Hablar',
          meaning: 'To speak',
          stem: 'Habl',
          conjugations: {
            'Presente': [
              { pronoun: 'Yo (I)', stem: 'Habl', ending: 'o', fullForm: 'Hablo', translation: 'I speak' },
              { pronoun: 'Tú (You)', stem: 'Habl', ending: 'as', fullForm: 'Hablas', translation: 'You speak' },
              { pronoun: 'Él/Ella (He/She)', stem: 'Habl', ending: 'a', fullForm: 'Habla', translation: 'He/she speaks' },
              { pronoun: 'Nosotros (We)', stem: 'Habl', ending: 'amos', fullForm: 'Hablamos', translation: 'We speak' },
              { pronoun: 'Vosotros (You pl.)', stem: 'Habl', ending: 'áis', fullForm: 'Habláis', translation: 'You all speak' },
              { pronoun: 'Ellos (They)', stem: 'Habl', ending: 'an', fullForm: 'Hablan', translation: 'They speak' }
            ],
            'Pretérito': [
              { pronoun: 'Yo (I)', stem: 'Habl', ending: 'é', fullForm: 'Hablé', translation: 'I spoke' },
              { pronoun: 'Tú (You)', stem: 'Habl', ending: 'aste', fullForm: 'Hablaste', translation: 'You spoke' },
              { pronoun: 'Él/Ella (He/She)', stem: 'Habl', ending: 'ó', fullForm: 'Habló', translation: 'He/she spoke' },
              { pronoun: 'Nosotros (We)', stem: 'Habl', ending: 'amos', fullForm: 'Hablamos', translation: 'We spoke' },
              { pronoun: 'Vosotros (You pl.)', stem: 'Habl', ending: 'asteis', fullForm: 'Hablasteis', translation: 'You all spoke' },
              { pronoun: 'Ellos (They)', stem: 'Habl', ending: 'aron', fullForm: 'Hablaron', translation: 'They spoke' }
            ],
            'Futuro': [
              { pronoun: 'Yo (I)', stem: 'Hablar', ending: 'é', fullForm: 'Hablaré', translation: 'I will speak' },
              { pronoun: 'Tú (You)', stem: 'Hablar', ending: 'ás', fullForm: 'Hablarás', translation: 'You will speak' },
              { pronoun: 'Él/Ella (He/She)', stem: 'Hablar', ending: 'á', fullForm: 'Hablará', translation: 'He/she will speak' },
              { pronoun: 'Nosotros (We)', stem: 'Hablar', ending: 'emos', fullForm: 'Hablaremos', translation: 'We will speak' },
              { pronoun: 'Vosotros (You pl.)', stem: 'Hablar', ending: 'éis', fullForm: 'Hablaréis', translation: 'You all will speak' },
              { pronoun: 'Ellos (They)', stem: 'Hablar', ending: 'án', fullForm: 'Hablarán', translation: 'They will speak' }
            ]
          }
        },
        {
          lemma: 'Comer',
          meaning: 'To eat',
          stem: 'Com',
          conjugations: {
            'Presente': [
              { pronoun: 'Yo (I)', stem: 'Com', ending: 'o', fullForm: 'Como', translation: 'I eat' },
              { pronoun: 'Tú (You)', stem: 'Com', ending: 'es', fullForm: 'Comes', translation: 'You eat' },
              { pronoun: 'Él/Ella (He/She)', stem: 'Com', ending: 'e', fullForm: 'Come', translation: 'He/she eats' },
              { pronoun: 'Nosotros (We)', stem: 'Com', ending: 'emos', fullForm: 'Comemos', translation: 'We eat' },
              { pronoun: 'Vosotros (You pl.)', stem: 'Com', ending: 'éis', fullForm: 'Coméis', translation: 'You all eat' },
              { pronoun: 'Ellos (They)', stem: 'Com', ending: 'en', fullForm: 'Comen', translation: 'They eat' }
            ],
            'Pretérito': [
              { pronoun: 'Yo (I)', stem: 'Com', ending: 'í', fullForm: 'Comí', translation: 'I ate' },
              { pronoun: 'Tú (You)', stem: 'Com', ending: 'iste', fullForm: 'Comiste', translation: 'You ate' },
              { pronoun: 'Él/Ella (He/She)', stem: 'Com', ending: 'ió', fullForm: 'Comió', translation: 'He/she ate' },
              { pronoun: 'Nosotros (We)', stem: 'Com', ending: 'imos', fullForm: 'Comimos', translation: 'We ate' },
              { pronoun: 'Vosotros (You pl.)', stem: 'Com', ending: 'isteis', fullForm: 'Comisteis', translation: 'You all ate' },
              { pronoun: 'Ellos (They)', stem: 'Com', ending: 'ieron', fullForm: 'Comieron', translation: 'They ate' }
            ],
            'Futuro': [
              { pronoun: 'Yo (I)', stem: 'Comer', ending: 'é', fullForm: 'Comeré', translation: 'I will eat' },
              { pronoun: 'Tú (You)', stem: 'Comer', ending: 'ás', fullForm: 'Comerás', translation: 'You will eat' },
              { pronoun: 'Él/Ella (He/She)', stem: 'Comer', ending: 'á', fullForm: 'Comerá', translation: 'He/she will eat' },
              { pronoun: 'Nosotros (We)', stem: 'Comer', ending: 'emos', fullForm: 'Comeremos', translation: 'We will eat' },
              { pronoun: 'Vosotros (You pl.)', stem: 'Comer', ending: 'éis', fullForm: 'Comeréis', translation: 'You all will eat' },
              { pronoun: 'Ellos (They)', stem: 'Comer', ending: 'án', fullForm: 'Comerán', translation: 'They will eat' }
            ]
          }
        }
      ],
      rules: [
        { title: 'Subject Pronoun Drop', tag: 'Syntax', description: 'Subject pronouns (yo, tú) are optional and usually omitted because the verb ending clarifies the subject.', example: 'Hablo español (not "Yo hablo")' },
        { title: 'Gender Agreement', tag: 'Agreement', description: 'Nouns are masculine (el) or feminine (la). Adjectives must agree in both gender and number.', example: 'El chico alto / La chica alta' },
        { title: 'Ser vs Estar', tag: 'Verbs', description: 'Ser describes permanent nature and identity; Estar describes states, locations, and conditions.', example: 'Soy profesor / Estoy cansado' },
        { title: 'Direct Object "a"', tag: 'Preposition', description: 'When the direct object of a verb is a person or pet, the personal "a" preposition is required.', example: 'Veo a María en el parque' }
      ]
    },

    // ────────────────────────── GERMAN ──────────────────────────
    de: {
      typology: 'V2 (Verb-Second) & SOV Subordinate',
      wordOrderSummary: 'German places the finite verb strictly in second position in main clauses, but moves it to the end in subordinate clauses.',
      keyRule: 'Four cases: Nominative (Subject), Accusative (Direct Object), Dative (Indirect Recipient), Genitive (Possessive).',
      tenses: ['Präsens', 'Präteritum', 'Perfekt'],
      verbs: [
        {
          lemma: 'Sprechen',
          meaning: 'To speak',
          stem: 'Sprech',
          conjugations: {
            'Präsens': [
              { pronoun: 'Ich (I)', stem: 'sprech', ending: 'e', fullForm: 'spreche', translation: 'I speak' },
              { pronoun: 'Du (You)', stem: 'sprich', ending: 'st', fullForm: 'sprichst', translation: 'You speak' },
              { pronoun: 'Er/Sie/Es (He/She/It)', stem: 'sprich', ending: 't', fullForm: 'spricht', translation: 'He speaks' },
              { pronoun: 'Wir (We)', stem: 'sprech', ending: 'en', fullForm: 'sprechen', translation: 'We speak' },
              { pronoun: 'Ihr (You pl.)', stem: 'sprech', ending: 't', fullForm: 'sprecht', translation: 'You all speak' },
              { pronoun: 'Sie/sie (They/Formal)', stem: 'sprech', ending: 'en', fullForm: 'sprechen', translation: 'They speak' }
            ],
            'Präteritum': [
              { pronoun: 'Ich (I)', stem: 'sprach', ending: '', fullForm: 'sprach', translation: 'I spoke' },
              { pronoun: 'Du (You)', stem: 'sprach', ending: 'st', fullForm: 'sprachst', translation: 'You spoke' },
              { pronoun: 'Er/Sie (He/She)', stem: 'sprach', ending: '', fullForm: 'sprach', translation: 'He spoke' },
              { pronoun: 'Wir (We)', stem: 'sprach', ending: 'en', fullForm: 'sprachen', translation: 'We spoke' },
              { pronoun: 'Ihr (You pl.)', stem: 'sprach', ending: 't', fullForm: 'spracht', translation: 'You all spoke' },
              { pronoun: 'Sie (They)', stem: 'sprach', ending: 'en', fullForm: 'sprachen', translation: 'They spoke' }
            ],
            'Perfekt': [
              { pronoun: 'Ich (I)', stem: 'habe ', ending: 'gesprochen', fullForm: 'habe gesprochen', translation: 'I have spoken' },
              { pronoun: 'Du (You)', stem: 'hast ', ending: 'gesprochen', fullForm: 'hast gesprochen', translation: 'You have spoken' },
              { pronoun: 'Er/Sie (He/She)', stem: 'hat ', ending: 'gesprochen', fullForm: 'hat gesprochen', translation: 'He has spoken' },
              { pronoun: 'Wir (We)', stem: 'haben ', ending: 'gesprochen', fullForm: 'haben gesprochen', translation: 'We have spoken' },
              { pronoun: 'Ihr (You pl.)', stem: 'habt ', ending: 'gesprochen', fullForm: 'habt gesprochen', translation: 'You all have spoken' },
              { pronoun: 'Sie (They)', stem: 'haben ', ending: 'gesprochen', fullForm: 'haben gesprochen', translation: 'They have spoken' }
            ]
          }
        }
      ],
      rules: [
        { title: 'Verb-Second (V2) Rule', tag: 'Word Order', description: 'In any declarative main sentence, the conjugated verb is ALWAYS the second element, even if an adverb is first.', example: 'Heute trinke ich Kaffee.' },
        { title: 'Three Genders', tag: 'Articles', description: 'Every noun is masculine (der), feminine (die), or neuter (das), declining across 4 grammatical cases.', example: 'Der Hund, die Katze, das Buch' },
        { title: 'Subordinate Verb End', tag: 'Clauses', description: 'Conjunctions like weil (because) or dass (that) send the conjugated verb to the very end of the clause.', example: '... weil ich Deutsch lerne.' },
        { title: 'Capitalization of Nouns', tag: 'Orthography', description: 'All nouns in German are capitalized without exception, making parts of speech visually distinct.', example: 'Die Sonne scheint hell.' }
      ]
    },

    // ────────────────────────── FRENCH ──────────────────────────
    fr: {
      typology: 'SVO (Subject - Verb - Object)',
      wordOrderSummary: 'French uses strict SVO structure with pronoun clitics preceding the conjugated verb.',
      keyRule: 'Object pronouns (le, la, lui, leur) precede the verb (e.g. Je te vois).',
      tenses: ['Présent', 'Passé Composé', 'Futur Simple'],
      verbs: [
        {
          lemma: 'Parler',
          meaning: 'To speak',
          stem: 'Parl',
          conjugations: {
            'Présent': [
              { pronoun: 'Je (I)', stem: 'parl', ending: 'e', fullForm: 'parle', translation: 'I speak' },
              { pronoun: 'Tu (You)', stem: 'parl', ending: 'es', fullForm: 'parles', translation: 'You speak' },
              { pronoun: 'Il/Elle (He/She)', stem: 'parl', ending: 'e', fullForm: 'parle', translation: 'He speaks' },
              { pronoun: 'Nous (We)', stem: 'parl', ending: 'ons', fullForm: 'parlons', translation: 'We speak' },
              { pronoun: 'Vous (You formal/pl.)', stem: 'parl', ending: 'ez', fullForm: 'parlez', translation: 'You speak' },
              { pronoun: 'Ils/Elles (They)', stem: 'parl', ending: 'ent', fullForm: 'parlent', translation: 'They speak' }
            ],
            'Passé Composé': [
              { pronoun: 'J\'ai', stem: 'parl', ending: 'é', fullForm: 'ai parlé', translation: 'I have spoken' },
              { pronoun: 'Tu as', stem: 'parl', ending: 'é', fullForm: 'as parlé', translation: 'You have spoken' },
              { pronoun: 'Il a', stem: 'parl', ending: 'é', fullForm: 'a parlé', translation: 'He has spoken' },
              { pronoun: 'Nous avons', stem: 'parl', ending: 'é', fullForm: 'avons parlé', translation: 'We have spoken' },
              { pronoun: 'Vous avez', stem: 'parl', ending: 'é', fullForm: 'avez parlé', translation: 'You have spoken' },
              { pronoun: 'Ils ont', stem: 'parl', ending: 'é', fullForm: 'ont parlé', translation: 'They have spoken' }
            ],
            'Futur Simple': [
              { pronoun: 'Je', stem: 'parler', ending: 'ai', fullForm: 'parlerai', translation: 'I will speak' },
              { pronoun: 'Tu', stem: 'parler', ending: 'as', fullForm: 'parleras', translation: 'You will speak' },
              { pronoun: 'Il/Elle', stem: 'parler', ending: 'a', fullForm: 'parlera', translation: 'He will speak' },
              { pronoun: 'Nous', stem: 'parler', ending: 'ons', fullForm: 'parlerons', translation: 'We will speak' },
              { pronoun: 'Vous', stem: 'parler', ending: 'ez', fullForm: 'parlerez', translation: 'You will speak' },
              { pronoun: 'Ils/Elles', stem: 'parler', ending: 'ont', fullForm: 'parleront', translation: 'They will speak' }
            ]
          }
        }
      ],
      rules: [
        { title: 'Gender & Articles', tag: 'Articles', description: 'Nouns are masculine (le, un) or feminine (la, une). They contract to l\' before vowel sounds.', example: 'Le pain, la pomme, l\'eau' },
        { title: 'Negation Structure', tag: 'Negation', description: 'Standard negation wraps around the verb with "ne ... pas" (often just "pas" in casual speech).', example: 'Je ne parle pas espagnol.' },
        { title: 'Liaison Mechanics', tag: 'Phonology', description: 'A normally silent final consonant is pronounced when the following word begins with a vowel.', example: 'Les amis [le.za.mi]' },
        { title: 'Clitic Pronoun Placement', tag: 'Pronouns', description: 'Direct and indirect object pronouns come BEFORE the verb in simple tenses.', example: 'Je t\'aime (I love you).' }
      ]
    },

    // ────────────────────────── JAPANESE ──────────────────────────
    ja: {
      typology: 'SOV (Subject - Object - Verb)',
      wordOrderSummary: 'Japanese strictly places verbs at the very end of sentences, using grammatical particles (Joshi) to define syntactic roles.',
      keyRule: 'Topic is marked by は (wa), Subject by が (ga), and Direct Object by を (o). Verbs do not inflect for person or number.',
      tenses: ['辞書形 (Dictionary)', '丁寧形 (Polite -masu)', '過去形 (Past -mashita)'],
      verbs: [
        {
          lemma: '話す (Hanasu)',
          meaning: 'To speak',
          stem: 'Hanas',
          conjugations: {
            '辞書形 (Dictionary)': [
              { pronoun: 'Affirmative (Plain)', stem: '話', ending: 'す (hanasu)', fullForm: '話す', translation: 'Speaks / will speak' },
              { pronoun: 'Negative (Plain)', stem: '話', ending: 'さない (hanasanai)', fullForm: '話さない', translation: 'Does not speak' },
              { pronoun: 'Past (Plain)', stem: '話', ending: 'した (hanashita)', fullForm: '話した', translation: 'Spoke' },
              { pronoun: 'Past Neg. (Plain)', stem: '話', ending: 'さなかった (hanasanakatta)', fullForm: '話さなかった', translation: 'Did not speak' }
            ],
            '丁寧形 (Polite -masu)': [
              { pronoun: 'Affirmative (Polite)', stem: '話し', ending: 'ます (hanashimasu)', fullForm: '話します', translation: 'I / you / they speak' },
              { pronoun: 'Negative (Polite)', stem: '話し', ending: 'ません (hanashimasen)', fullForm: '話しません', translation: 'Do not speak' },
              { pronoun: 'Volitional (Let\'s)', stem: '話し', ending: 'ましょう (hanashimashō)', fullForm: '話しましょう', translation: 'Let\'s speak' }
            ],
            '過去形 (Past -mashita)': [
              { pronoun: 'Past (Polite)', stem: '話し', ending: 'ました (hanashimashita)', fullForm: '話しました', translation: 'Spoke (polite)' },
              { pronoun: 'Past Neg. (Polite)', stem: '話し', ending: 'ませんでした', fullForm: '話しませんでした', translation: 'Did not speak (polite)' }
            ]
          }
        }
      ],
      rules: [
        { title: 'SOV Particle Mechanics', tag: 'Particles', description: 'Particles attach directly to nouns to mark their grammatical function: は (topic), を (object), に (direction/time).', example: '私 は 日本語 を 話します (I speak Japanese).' },
        { title: 'Subject / Topic Omission', tag: 'Context', description: 'If the subject or topic is obvious from context, it is almost always omitted for natural Japanese.', example: '日本語を話します (I speak Japanese).' },
        { title: 'No Person/Number Inflection', tag: 'Verbs', description: 'Japanese verbs do not change for I, you, he, or they. The exact same form applies to all subjects.', example: '食べます (I eat / you eat / they eat).' },
        { title: 'Question Particle か (Ka)', tag: 'Syntax', description: 'Adding か (ka) to the end of a sentence turns it into a question without changing word order.', example: '話しますか？ (Do you speak?)' }
      ]
    },

    // ────────────────────────── ARABIC ──────────────────────────
    ar: {
      typology: 'VSO / SVO with Triconsonantal Roots',
      wordOrderSummary: 'Classical Arabic is predominantly VSO (Verb-Subject-Object), while modern dialects frequently use SVO. Words derive from 3-letter roots.',
      keyRule: 'Words derive from 3-letter consonantal roots (Jithr), e.g., k-t-b produces kitāb (book), maktūb (written), kātib (writer).',
      tenses: ['الماضي (Past)', 'المضارع (Present)'],
      verbs: [
        {
          lemma: 'كَتَبَ (Kataba)',
          meaning: 'To write',
          stem: 'k-t-b',
          conjugations: {
            'الماضي (Past)': [
              { pronoun: 'أَنَا (I)', stem: 'كَتَبْ', ending: 'تُ (katabtu)', fullForm: 'كَتَبْتُ', translation: 'I wrote' },
              { pronoun: 'أَنْتَ (You m.)', stem: 'كَتَبْ', ending: 'تَ (katabta)', fullForm: 'كَتَبْتَ', translation: 'You (m) wrote' },
              { pronoun: 'أَنْتِ (You f.)', stem: 'كَتَبْ', ending: 'تِ (katabti)', fullForm: 'كَتَبْتِ', translation: 'You (f) wrote' },
              { pronoun: 'هُوَ (He)', stem: 'كَتَ', ending: 'بَ (kataba)', fullForm: 'كَتَبَ', translation: 'He wrote' },
              { pronoun: 'هِيَ (She)', stem: 'كَتَبَ', ending: 'تْ (katabat)', fullForm: 'كَتَبَتْ', translation: 'She wrote' },
              { pronoun: 'نَحْنُ (We)', stem: 'كَتَبْ', ending: 'نَا (katabnā)', fullForm: 'كَتَبْنَا', translation: 'We wrote' }
            ],
            'المضارع (Present)': [
              { pronoun: 'أَنَا (I)', stem: 'أَكْتُ', ending: 'بُ (aktubu)', fullForm: 'أَكْتُبُ', translation: 'I write' },
              { pronoun: 'أَنْتَ (You m.)', stem: 'تَكْتُ', ending: 'بُ (taktubu)', fullForm: 'تَكْتُبُ', translation: 'You (m) write' },
              { pronoun: 'هُوَ (He)', stem: 'يَكْتُ', ending: 'بُ (yaktubu)', fullForm: 'يَكْتُبُ', translation: 'He writes' },
              { pronoun: 'هِيَ (She)', stem: 'تَكْتُ', ending: 'بُ (taktubu)', fullForm: 'تَكْتُبُ', translation: 'She writes' },
              { pronoun: 'نَحْنُ (We)', stem: 'نَكْتُ', ending: 'بُ (naktubu)', fullForm: 'نَكْتُبُ', translation: 'We write' },
              { pronoun: 'هُمْ (They m.)', stem: 'يَكْتُبُ', ending: 'ونَ (yaktubūna)', fullForm: 'يَكْتُبُونَ', translation: 'They write' }
            ]
          }
        }
      ],
      rules: [
        { title: 'Triconsonantal Root System', tag: 'Morphology', description: 'Almost all Arabic vocabulary branches from a 3-letter root (e.g. K-T-B = writing, D-R-S = studying).', example: 'كَتَبَ (wrote) / كِتَاب (book) / مَكْتَب (office)' },
        { title: 'Definite Article Al- (الـ)', tag: 'Articles', description: 'The prefix Al- marks definiteness and assimilates into sun letters (Shamsiyyah) like T, D, R, S.', example: 'الكِتَاب (The book) / الشَّمْس (The sun)' },
        { title: 'Gender in All Pronouns', tag: 'Gender', description: 'Arabic distinguishes masculine and feminine not just in 3rd person (he/she), but also in 2nd person (you m./you f.).', example: 'أَنْتَ (anta - you m.) / أَنْتِ (anti - you f.)' },
        { title: 'Dual Number (Muthanna)', tag: 'Grammar', description: 'Arabic has a distinct grammatical category for exactly two items (-ān / -ayn), alongside singular and plural.', example: 'كِتَابَانِ (two books)' }
      ]
    },

    // ────────────────────────── TAMIL ──────────────────────────
    ta: {
      typology: 'SOV (Subject - Object - Verb)',
      wordOrderSummary: 'Tamil is an agglutinative SOV language where verbs appear at the end, taking suffixes for tense, person, and politeness.',
      keyRule: 'Agglutinative suffixes attach to verb roots to encode tense and subject agreement simultaneously.',
      tenses: ['நிகழ்காலம் (Present)', 'இறந்தகாலம் (Past)', 'எதிர்காலம் (Future)'],
      verbs: [
        {
          lemma: 'பேசு (Pēsu)',
          meaning: 'To speak',
          stem: 'Pēsu',
          conjugations: {
            'நிகழ்காலம் (Present)': [
              { pronoun: 'நான் (I)', stem: 'பேசு', ending: 'கிறேன் (-kirēn)', fullForm: 'பேசுகிறேன்', translation: 'I speak' },
              { pronoun: 'நீ (You informal)', stem: 'பேசு', ending: 'கிறாய் (-kirāy)', fullForm: 'பேசுகிறாய்', translation: 'You speak' },
              { pronoun: 'நீங்கள் (You polite)', stem: 'பேசு', ending: 'கிறீர்கள் (-kirīrkal)', fullForm: 'பேசுகிறீர்கள்', translation: 'You speak (polite)' },
              { pronoun: 'அவன் (He)', stem: 'பேசு', ending: 'கிறான் (-kirān)', fullForm: 'பேசுகிறான்', translation: 'He speaks' },
              { pronoun: 'அவள் (She)', stem: 'பேசு', ending: 'கிறாள் (-kirāl)', fullForm: 'பேசுகிறாள்', translation: 'She speaks' },
              { pronoun: 'நாங்கள் (We)', stem: 'பேசு', ending: 'கிறோம் (-kirōm)', fullForm: 'பேசுகிறோம்', translation: 'We speak' }
            ],
            'இறந்தகாலம் (Past)': [
              { pronoun: 'நான் (I)', stem: 'பேசி', ending: 'னேன் (-nēn)', fullForm: 'பேசினேன்', translation: 'I spoke' },
              { pronoun: 'நீ (You)', stem: 'பேசி', ending: 'னாய் (-nāy)', fullForm: 'பேசினாய்', translation: 'You spoke' },
              { pronoun: 'நீங்கள் (You polite)', stem: 'பேசி', ending: 'னீர்கள் (-nīrkal)', fullForm: 'பேசினீர்கள்', translation: 'You spoke (polite)' },
              { pronoun: 'அவன் (He)', stem: 'பேசி', ending: 'னான் (-nān)', fullForm: 'பேசினான்', translation: 'He spoke' },
              { pronoun: 'அவள் (She)', stem: 'பேசி', ending: 'னாள் (-nāl)', fullForm: 'பேசினாள்', translation: 'She spoke' },
              { pronoun: 'நாங்கள் (We)', stem: 'பேசி', ending: 'னோம் (-nōm)', fullForm: 'பேசினோம்', translation: 'We spoke' }
            ],
            'எதிர்காலம் (Future)': [
              { pronoun: 'நான் (I)', stem: 'பேசு', ending: 'வேன் (-vēn)', fullForm: 'பேசுவேன்', translation: 'I will speak' },
              { pronoun: 'நீ (You)', stem: 'பேசு', ending: 'வாய் (-vāy)', fullForm: 'பேசுவாய்', translation: 'You will speak' },
              { pronoun: 'நீங்கள் (You polite)', stem: 'பேசு', ending: 'வீர்கள் (-vīrkal)', fullForm: 'பேசுவீர்கள்', translation: 'You will speak (polite)' },
              { pronoun: 'அவன் (He)', stem: 'பேசு', ending: 'வான் (-vān)', fullForm: 'பேசுவான்', translation: 'He will speak' },
              { pronoun: 'அவள் (She)', stem: 'பேசு', ending: 'வாள் (-vāl)', fullForm: 'பேசுவாள்', translation: 'She will speak' },
              { pronoun: 'நாங்கள் (We)', stem: 'பேசு', ending: 'வோம் (-vōm)', fullForm: 'பேசுவோம்', translation: 'We will speak' }
            ]
          }
        }
      ],
      rules: [
        { title: 'Strict SOV Word Order', tag: 'Syntax', description: 'The verb consistently finishes the clause: Subject precedes Object, which precedes the Verb.', example: 'நான் தமிழ் பேசுகிறேன் (Naan Tamil pesugiren).' },
        { title: 'Agglutinative Postpositions', tag: 'Morphology', description: 'Tamil uses attached case endings instead of separate prepositions: -ukku (to), -il (in), -odu (with).', example: 'வீட்டுக்கு (veettukku - to home)' },
        { title: 'Honorific Distinction', tag: 'Politeness', description: 'Adding -kal to pronouns and verbs conveys deep respect: நீ (nee - you informal) vs நீங்கள் (neengal - you respectful).', example: 'வாருங்கள் (Vaarungal - Please come)' },
        { title: 'Clitic Question Marker -aa', tag: 'Questions', description: 'Adding the vowel -aa to the final word forms a question without rearranging sentence constituents.', example: 'நீங்கள் தமிழா? (Neengal Tamizhaa? - Are you Tamil?)' }
      ]
    }
  };

  public activeProfile = computed(() => {
    return this.GRAMMAR_PROFILES[this.langService.selectedLanguage().id] || this.GRAMMAR_PROFILES['es'];
  });

  public currentConjugationSlots = computed(() => {
    const prof = this.activeProfile();
    const vIdx = Math.min(this.selectedVerbIndex(), prof.verbs.length - 1);
    const verb = prof.verbs[vIdx] || prof.verbs[0];
    const tIdx = Math.min(this.selectedTenseIndex(), prof.tenses.length - 1);
    const tenseName = prof.tenses[tIdx] || prof.tenses[0];

    return verb.conjugations[tenseName] || [];
  });

  speak(text: string) {
    this.tts.speak(text, this.langService.selectedLanguage().locale_code);
  }
}
