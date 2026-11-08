import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { ToastService } from '../../core/services/toast.service';

interface PhonemeItem {
  symbol: string;
  name: string;
  exampleWord: string;
  exampleTranslation: string;
  category: 'Vowel' | 'Consonant' | 'Emphatic' | 'Nasal';
}

interface MinimalPair {
  id: string;
  soundA: string;
  wordA: string;
  transA: string;
  soundB: string;
  wordB: string;
  transB: string;
  target: 'A' | 'B';
}

@Component({
  selector: 'app-phonetics-lab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Acoustic Phonology Lab</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Phonetics & IPA Articulation Studio
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Master the International Phonetic Alphabet (IPA) consonants, vowels, and acoustic minimal pair discrimination for {{ langService.selectedLanguage().name }}.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-600 dark:text-zinc-300">
            Locale: {{ langService.selectedLanguage().locale_code }}
          </span>
        </div>
      </div>

      <!-- SECTION 1: MINIMAL PAIRS DISCRIMINATION CHALLENGE -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Minimal Pair Acoustic Discrimination Drill
          </span>
          <span class="text-xs font-mono text-slate-400 dark:text-zinc-500">Round 01 of 03</span>
        </div>

        <p class="text-sm text-slate-600 dark:text-zinc-300 mb-6">
          Listen to the audio sample and select which word was pronounced:
        </p>

        <!-- Audio Play Button -->
        <div class="flex flex-col items-center justify-center my-6 gap-3">
          <button
            (click)="playTargetMinimalPair()"
            class="w-18 h-18 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            title="Play Mystery Audio"
          >
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          <span class="text-xs font-mono text-slate-500 dark:text-zinc-400 font-medium">Click to Play Mystery Acoustic Target</span>
        </div>

        <!-- Choice Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
          <!-- Option A -->
          <button
            (click)="verifyChoice('A')"
            class="p-5 rounded-xl border text-left transition-all active:scale-[0.98] group"
            [ngClass]="selectedChoice() === 'A'
              ? (choiceResult() === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/30')
              : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-zinc-800'"
          >
            <div class="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-1 font-semibold">Option A • [{{ currentPair.soundA }}]</div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">{{ currentPair.wordA }}</div>
            <div class="text-xs text-slate-500 dark:text-zinc-400 mt-1">{{ currentPair.transA }}</div>
          </button>

          <!-- Option B -->
          <button
            (click)="verifyChoice('B')"
            class="p-5 rounded-xl border text-left transition-all active:scale-[0.98] group"
            [ngClass]="selectedChoice() === 'B'
              ? (choiceResult() === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/30')
              : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-zinc-800'"
          >
            <div class="text-xs font-mono text-cyan-600 dark:text-cyan-400 mb-1 font-semibold">Option B • [{{ currentPair.soundB }}]</div>
            <div class="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{{ currentPair.wordB }}</div>
            <div class="text-xs text-slate-500 dark:text-zinc-400 mt-1">{{ currentPair.transB }}</div>
          </button>
        </div>

        <!-- Feedback Result -->
        <div *ngIf="choiceResult()" class="text-center mt-6">
          <span
            class="px-4 py-2 rounded-xl text-xs font-mono font-bold inline-flex items-center gap-1.5"
            [ngClass]="choiceResult() === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'"
          >
            {{ choiceResult() === 'correct' ? '✓ Correct! Acoustic discrimination matched!' : '✕ Incorrect. Listen closely to the subtle vowel/consonant contrast.' }}
          </span>
        </div>
      </div>

      <!-- SECTION 2: INTERACTIVE IPA PHONEME MATRIX -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🔬</span>
            <span>Interactive IPA Phoneme Matrix (Tap to Hear)</span>
          </h3>
          <span class="text-xs font-mono text-slate-500 dark:text-zinc-400">IPA International Phonetic Chart</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button
            *ngFor="let p of phonemes"
            (click)="playPhoneme(p)"
            class="p-4 rounded-xl surface-card hover:bg-slate-50 dark:hover:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group flex flex-col justify-between shadow-xs hover:shadow-sm"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-2xl font-bold font-serif text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  {{ p.symbol }}
                </span>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {{ p.category }}
                </span>
              </div>
              <div class="text-xs font-semibold text-slate-900 dark:text-zinc-100">{{ p.name }}</div>
            </div>

            <div class="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400">
              <span class="text-slate-800 dark:text-zinc-200 font-medium">{{ p.exampleWord }}</span>
              <span class="block text-[10px] text-slate-400 dark:text-zinc-500 italic">{{ p.exampleTranslation }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class PhoneticsLabComponent {
  public langService = inject(LanguageService);
  private tts = inject(TextToSpeechService);
  private sfx = inject(AudioSfxService);
  private toast = inject(ToastService);

  public selectedChoice = signal<'A' | 'B' | null>(null);
  public choiceResult = signal<'correct' | 'incorrect' | null>(null);

  private readonly MINIMAL_PAIRS: Record<string, MinimalPair> = {
    es: {
      id: 'mp-es',
      soundA: 'ɾ',
      wordA: 'Pero',
      transA: 'But (Single alveolar flap)',
      soundB: 'r',
      wordB: 'Perro',
      transB: 'Dog (Trilled alveolar r)',
      target: 'B'
    },
    de: {
      id: 'mp-de',
      soundA: 'ʃ',
      wordA: 'Kirsche',
      transA: 'Cherry (Postalveolar fricative)',
      soundB: 'ç',
      wordB: 'Kirche',
      transB: 'Church (Palatal ich-Laut fricative)',
      target: 'B'
    },
    ja: {
      id: 'mp-ja',
      soundA: 'o.dʑi.saɴ',
      wordA: 'おじさん (Ojisan)',
      transA: 'Uncle (Short mora vowel)',
      soundB: 'o.dʑiː.saɴ',
      wordB: 'おじいさん (Ojiisan)',
      transB: 'Grandfather (Elongated two-mora vowel)',
      target: 'B'
    },
    ar: {
      id: 'mp-ar',
      soundA: 'q',
      wordA: 'قَلْب (Qalb)',
      transA: 'Heart (Voiceless uvular stop)',
      soundB: 'k',
      wordB: 'كَلْب (Kalb)',
      transB: 'Dog (Voiceless velar stop)',
      target: 'A'
    },
    fr: {
      id: 'mp-fr',
      soundA: 'y',
      wordA: 'Dessus',
      transA: 'Above / on top (Close front rounded)',
      soundB: 'u',
      wordB: 'Dessous',
      transB: 'Below / underneath (Close back rounded)',
      target: 'A'
    },
    ta: {
      id: 'mp-ta',
      soundA: 'li',
      wordA: 'புலி (Puli)',
      transA: 'Tiger (Alveolar lateral l)',
      soundB: 'ɭi',
      wordB: 'புளி (Puli)',
      transB: 'Tamarind (Retroflex lateral ɭ)',
      target: 'B'
    }
  };

  private readonly PHONEME_DATA: Record<string, PhonemeItem[]> = {
    es: [
      { symbol: '/β/', name: 'Voiced bilabial fricative', exampleWord: 'Saber', exampleTranslation: 'To know', category: 'Consonant' },
      { symbol: '/θ/', name: 'Voiceless dental fricative', exampleWord: 'Zapato', exampleTranslation: 'Shoe', category: 'Consonant' },
      { symbol: '/x/', name: 'Voiceless velar fricative', exampleWord: 'Gente', exampleTranslation: 'People', category: 'Consonant' },
      { symbol: '/ɲ/', name: 'Palatal nasal', exampleWord: 'Niño', exampleTranslation: 'Child', category: 'Nasal' },
      { symbol: '/r/', name: 'Alveolar trill', exampleWord: 'Río', exampleTranslation: 'River', category: 'Consonant' },
      { symbol: '/a/', name: 'Open front vowel', exampleWord: 'Casa', exampleTranslation: 'House', category: 'Vowel' },
      { symbol: '/e/', name: 'Close-mid front vowel', exampleWord: 'Mesa', exampleTranslation: 'Table', category: 'Vowel' },
      { symbol: '/i/', name: 'Close front vowel', exampleWord: 'Libro', exampleTranslation: 'Book', category: 'Vowel' },
      { symbol: '/o/', name: 'Close-mid back vowel', exampleWord: 'Sol', exampleTranslation: 'Sun', category: 'Vowel' },
      { symbol: '/u/', name: 'Close back vowel', exampleWord: 'Luz', exampleTranslation: 'Light', category: 'Vowel' },
      { symbol: '/ʝ/', name: 'Voiced palatal fricative', exampleWord: 'Playa', exampleTranslation: 'Beach', category: 'Consonant' },
      { symbol: '/tʃ/', name: 'Voiceless affricate', exampleWord: 'Noche', exampleTranslation: 'Night', category: 'Consonant' }
    ],
    de: [
      { symbol: '/ç/', name: 'Ich-Laut palatal', exampleWord: 'Licht', exampleTranslation: 'Light', category: 'Consonant' },
      { symbol: '/x/', name: 'Ach-Laut velar', exampleWord: 'Buch', exampleTranslation: 'Book', category: 'Consonant' },
      { symbol: '/ʁ/', name: 'Uvular fricative r', exampleWord: 'Rot', exampleTranslation: 'Red', category: 'Consonant' },
      { symbol: '/pf/', name: 'Labiodental affricate', exampleWord: 'Pferd', exampleTranslation: 'Horse', category: 'Consonant' },
      { symbol: '/ts/', name: 'Alveolar affricate', exampleWord: 'Zeit', exampleTranslation: 'Time', category: 'Consonant' },
      { symbol: '/yː/', name: 'Close front rounded (ü)', exampleWord: 'Tür', exampleTranslation: 'Door', category: 'Vowel' },
      { symbol: '/øː/', name: 'Close-mid rounded (ö)', exampleWord: 'Schön', exampleTranslation: 'Beautiful', category: 'Vowel' },
      { symbol: '/ɛː/', name: 'Open-mid front (ä)', exampleWord: 'Käse', exampleTranslation: 'Cheese', category: 'Vowel' },
      { symbol: '/ʃ/', name: 'Voiceless postalveolar', exampleWord: 'Schule', exampleTranslation: 'School', category: 'Consonant' },
      { symbol: '/ŋ/', name: 'Velar nasal', exampleWord: 'Singen', exampleTranslation: 'To sing', category: 'Nasal' }
    ],
    ja: [
      { symbol: '/ɕ/', name: 'Alveolo-palatal sh', exampleWord: '寿司', exampleTranslation: 'Sushi', category: 'Consonant' },
      { symbol: '/ts/', name: 'Alveolar affricate ts', exampleWord: '月', exampleTranslation: 'Moon / Tsuki', category: 'Consonant' },
      { symbol: '/ɲ/', name: 'Palatal nasal ni', exampleWord: '日本', exampleTranslation: 'Japan / Nihon', category: 'Nasal' },
      { symbol: '/ɰ/', name: 'Velar approximant w', exampleWord: '私', exampleTranslation: 'I / Watashi', category: 'Consonant' },
      { symbol: '/ɾ/', name: 'Alveolar tap r', exampleWord: '雨', exampleTranslation: 'Rain / Ame', category: 'Consonant' },
      { symbol: '/ɯᵝ/', name: 'Compressed close vowel u', exampleWord: '歌', exampleTranslation: 'Song / Uta', category: 'Vowel' },
      { symbol: '/N/', name: 'Uvular moraic nasal ん', exampleWord: '本', exampleTranslation: 'Book / Hon', category: 'Nasal' },
      { symbol: '/kː/', name: 'Geminate sokuon っ', exampleWord: '切手', exampleTranslation: 'Stamp / Kitte', category: 'Consonant' }
    ],
    ar: [
      { symbol: '/ħ/', name: 'Voiceless pharyngeal ح', exampleWord: 'حَلِيب', exampleTranslation: 'Milk (Haleeb)', category: 'Emphatic' },
      { symbol: '/ʕ/', name: 'Voiced pharyngeal ع', exampleWord: 'عَيْن', exampleTranslation: 'Eye (\'Ayn)', category: 'Emphatic' },
      { symbol: '/sˤ/', name: 'Emphatic ص', exampleWord: 'صَبَاح', exampleTranslation: 'Morning (Sabah)', category: 'Emphatic' },
      { symbol: '/dˤ/', name: 'Emphatic ض', exampleWord: 'ضَوْء', exampleTranslation: 'Light (Daw\')', category: 'Emphatic' },
      { symbol: '/tˤ/', name: 'Emphatic ط', exampleWord: 'طَالِب', exampleTranslation: 'Student (Talib)', category: 'Emphatic' },
      { symbol: '/q/', name: 'Uvular stop ق', exampleWord: 'قَلَم', exampleTranslation: 'Pen (Qalam)', category: 'Consonant' },
      { symbol: '/ɣ/', name: 'Voiced velar fricative غ', exampleWord: 'غَرِيب', exampleTranslation: 'Strange (Ghareeb)', category: 'Consonant' },
      { symbol: '/x/', name: 'Voiceless velar fricative خ', exampleWord: 'خُبْز', exampleTranslation: 'Bread (Khubz)', category: 'Consonant' }
    ],
    fr: [
      { symbol: '/ʁ/', name: 'Voiced uvular fricative r', exampleWord: 'Rouge', exampleTranslation: 'Red', category: 'Consonant' },
      { symbol: '/ɑ̃/', name: 'Nasal open back vowel', exampleWord: 'Enfant', exampleTranslation: 'Child', category: 'Nasal' },
      { symbol: '/ɔ̃/', name: 'Nasal close-mid back', exampleWord: 'Bonbon', exampleTranslation: 'Candy', category: 'Nasal' },
      { symbol: '/ɛ̃/', name: 'Nasal open-mid front', exampleWord: 'Matin', exampleTranslation: 'Morning', category: 'Nasal' },
      { symbol: '/y/', name: 'Close front rounded u', exampleWord: 'Lune', exampleTranslation: 'Moon', category: 'Vowel' },
      { symbol: '/ø/', name: 'Close-mid front rounded eu', exampleWord: 'Bleu', exampleTranslation: 'Blue', category: 'Vowel' },
      { symbol: '/œ/', name: 'Open-mid front rounded œu', exampleWord: 'Cœur', exampleTranslation: 'Heart', category: 'Vowel' },
      { symbol: '/ɲ/', name: 'Palatal nasal gn', exampleWord: 'Montagne', exampleTranslation: 'Mountain', category: 'Nasal' }
    ],
    ta: [
      { symbol: '/ɻ/', name: 'Retroflex approximant ழ (zha)', exampleWord: 'தமிழ்', exampleTranslation: 'Tamil', category: 'Emphatic' },
      { symbol: '/ɭ/', name: 'Retroflex lateral ள (La)', exampleWord: 'பள்ளி', exampleTranslation: 'School', category: 'Consonant' },
      { symbol: '/ɳ/', name: 'Retroflex nasal ண (Na)', exampleWord: 'கண்', exampleTranslation: 'Eye', category: 'Nasal' },
      { symbol: '/ʈ/', name: 'Retroflex voiceless stop ட', exampleWord: 'பட்டம்', exampleTranslation: 'Kite', category: 'Consonant' },
      { symbol: '/ŋ/', name: 'Velar nasal ங (Nga)', exampleWord: 'சங்கு', exampleTranslation: 'Conch', category: 'Nasal' },
      { symbol: '/ɲ/', name: 'Palatal nasal ஞ (Nya)', exampleWord: 'ஞாயிறு', exampleTranslation: 'Sunday', category: 'Nasal' }
    ]
  };

  get currentPair(): MinimalPair {
    const langId = this.langService.selectedLanguage().id;
    return this.MINIMAL_PAIRS[langId] || this.MINIMAL_PAIRS['es'];
  }

  get phonemes(): PhonemeItem[] {
    const langId = this.langService.selectedLanguage().id;
    return this.PHONEME_DATA[langId] || this.PHONEME_DATA['es'];
  }

  playTargetMinimalPair() {
    const pair = this.currentPair;
    const word = pair.target === 'A' ? pair.wordA : pair.wordB;
    this.tts.speak(word, this.langService.selectedLanguage().locale_code, 0.85);
  }

  verifyChoice(choice: 'A' | 'B') {
    this.selectedChoice.set(choice);
    if (choice === this.currentPair.target) {
      this.choiceResult.set('correct');
      this.sfx.playSuccess();
      this.toast.show('Excellent! Correct phoneme identified.', 'success');
    } else {
      this.choiceResult.set('incorrect');
      this.sfx.playError();
      this.toast.show('Listen closely to the acoustic difference.', 'warning');
    }
  }

  playPhoneme(p: PhonemeItem) {
    this.tts.speak(p.exampleWord, this.langService.selectedLanguage().locale_code);
    this.toast.show(`Phoneme ${p.symbol} in word: ${p.exampleWord}`, 'info', 1800);
  }
}

