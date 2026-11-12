import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PhraseService } from '../../core/services/phrase.service';
import { SUPPORTED_LANGUAGES } from '../../core/services/language.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-phrasebook',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ScrollRevealDirective],
  template: `
    <div class="min-h-screen bg-[#FFFBF0] dark:bg-[#0C0A05] text-stone-900 dark:text-stone-100 transition-colors">

      <!-- NAV BAR -->
      <nav class="sticky top-0 z-30 bg-[#FFFBF0]/90 dark:bg-[#0C0A05]/90 backdrop-blur-xl border-b border-stone-900/10 dark:border-sun-300/10">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <!-- Back Button -->
            <a
              [routerLink]="auth.isAuthenticated() ? '/dashboard' : '/welcome'"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-900/10 dark:border-sun-300/10 bg-white dark:bg-white/5 hover:bg-sun-200 dark:hover:bg-sun-400/15 text-xs font-bold transition-all text-stone-700 dark:text-stone-300 shrink-0"
            >
              <span>←</span>
              <span>{{ auth.isAuthenticated() ? 'Dashboard' : 'Home' }}</span>
            </a>

            <span class="text-stone-300 dark:text-stone-700 hidden sm:inline">/</span>

            <a routerLink="/welcome" class="hidden sm:flex items-center gap-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors">
              <span class="grid h-7 w-7 place-items-center rounded-lg border border-stone-950 bg-sun-400 text-xs shadow-xs">☀️</span>
              <span class="hidden md:inline">PolyglotStudio</span>
            </a>

            <span class="text-stone-300 dark:text-stone-700">/</span>

            <!-- Active Language Badge + Switcher -->
            <div class="relative">
              <button
                type="button"
                (click)="langMenuOpen = !langMenuOpen"
                class="text-xs font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 rounded-full border border-stone-900/10 bg-white px-3 py-1 dark:border-sun-300/15 dark:bg-white/5 hover:bg-sun-100 dark:hover:bg-sun-400/10 transition-colors shadow-xs"
              >
                <span class="text-base select-none">{{ lang()?.flag_emoji }}</span>
                <span>{{ lang()?.name }}</span>
                <span class="text-[9px] text-stone-400">▼</span>
              </button>

              <div *ngIf="langMenuOpen" class="absolute top-11 left-0 w-48 rounded-2xl border-2 border-stone-950/15 bg-white dark:bg-[#1A150A] p-2 shadow-2xl z-50 animate-fadeIn">
                <div class="text-[9px] font-mono uppercase text-stone-400 px-2 py-1 font-bold">Switch Language</div>
                <a
                  *ngFor="let l of allLanguages"
                  [routerLink]="['/learn', l.id]"
                  (click)="langMenuOpen = false"
                  class="flex items-center justify-between p-2 rounded-xl text-xs font-bold hover:bg-sun-100 dark:hover:bg-sun-400/10 transition-colors"
                  [class.bg-sun-200]="l.id === langId()"
                >
                  <span class="flex items-center gap-2"><span>{{ l.flag_emoji }}</span> {{ l.name }}</span>
                  <span class="text-[10px] text-stone-400 font-mono">420</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Right: Smart Review Button -->
          <div class="flex items-center gap-2 shrink-0">
            <a
              [routerLink]="['/quiz', langId(), 'essentials']"
              (click)="sfx.playLevelUp()"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-stone-950 bg-sun-400 text-stone-950 text-xs font-extrabold shadow-[2px_2px_0_0_#1c1917] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none dark:border-sun-200 dark:shadow-[2px_2px_0_0_rgba(255,226,77,0.85)]"
            >
              <span>⚡</span> <span>Smart review</span>
            </a>
          </div>
        </div>
      </nav>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <!-- Language Hero -->
        <div class="relative overflow-hidden rounded-[2rem] border-2 border-stone-950 bg-sun-400 p-6 text-stone-950 shadow-[8px_8px_0_0_#1c1917] dark:border-sun-200 dark:shadow-[8px_8px_0_0_rgba(255,226,77,0.85)] sm:p-9" appReveal>
          <div class="pointer-events-none absolute inset-0 sunburst-bg opacity-60"></div>
          <div class="pointer-events-none absolute -right-8 -top-10 text-[7rem] opacity-15 select-none">🗺️</div>
          <div class="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <span class="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-2 border-stone-950/80 bg-white/60 text-5xl shadow-[4px_4px_0_0_rgba(28,25,23,0.6)] select-none animate-float sm:h-24 sm:w-24 sm:text-6xl">{{ lang()?.flag_emoji }}</span>
            <div class="flex-1">
              <div class="text-[10px] font-mono uppercase tracking-[0.2em] font-extrabold text-stone-800/80">Language phrasebook</div>
              <h1 class="mt-1 font-display text-3xl sm:text-4xl font-extrabold tracking-tight">{{ lang()?.name }}</h1>
              <div class="text-lg font-bold text-stone-800/80 mt-0.5" [dir]="lang()?.script_direction">{{ lang()?.native_name }}</div>
              <div class="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span class="flex items-center gap-1.5 rounded-full border border-stone-950/15 bg-white/50 px-3 py-1">
                  <span>📚</span> {{ totalPhrases() }} phrases
                </span>
                <span class="flex items-center gap-1.5 rounded-full border border-stone-950/15 bg-white/50 px-3 py-1">
                  <span>🗂️</span> {{ categories().length }} topics
                </span>
                <span class="flex items-center gap-1.5 rounded-full border border-stone-950/15 bg-white/50 px-3 py-1">
                  <span class="animate-pulse">🎧</span> Native audio
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Grid -->
        <div class="mt-10">
          <div class="flex flex-wrap items-end justify-between gap-2 mb-5">
            <div>
              <h2 class="font-display text-xl font-extrabold text-stone-900 dark:text-stone-100">
                14 practical scenarios
              </h2>
              <p class="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Tap any topic to open its phrase cards.</p>
            </div>
            <span class="rounded-full border border-sun-600/20 bg-sun-100 px-2.5 py-1 text-[9px] font-mono font-extrabold uppercase tracking-wider text-sun-800 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200">
              Zero textbook fog
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <a
              *ngFor="let cat of categories(); let i = index"
              [routerLink]="['/learn', langId(), cat.id]"
              (click)="sfx.playCardFlip()"
              [appRevealDelay]="i * 35"
              appReveal
              class="group relative overflow-hidden bg-white dark:bg-[#161208] rounded-2xl border-2 border-stone-900/10 dark:border-sun-300/10 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-stone-950 hover:shadow-[6px_6px_0_0_#FFD21E] dark:hover:border-sun-300/50 dark:hover:shadow-[6px_6px_0_0_rgba(255,210,30,0.7)] flex flex-col justify-between active:scale-[0.98]"
            >
              <div class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sun-200/40 blur-2xl transition-all duration-500 group-hover:scale-150 dark:bg-sun-400/10"></div>
              <div class="relative">
                <div class="flex items-start justify-between mb-3">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:-rotate-6 transition-transform shadow-xs border-2 border-stone-950/10 dark:border-sun-300/10"
                       [ngClass]="cat.badgeBg">
                    {{ cat.characterEmoji }}
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-stone-400">
                    {{ cat.count }} phrases
                  </span>
                </div>

                <div class="flex items-center gap-1.5 mb-1">
                  <span class="text-base">{{ cat.icon }}</span>
                  <h3 class="font-display font-extrabold text-base text-stone-900 dark:text-stone-100 group-hover:text-sun-700 dark:group-hover:text-sun-300 transition-colors">
                    {{ cat.name }}
                  </h3>
                </div>

                <div class="text-[10px] font-mono text-sun-700 dark:text-sun-300 font-bold mb-1">
                  {{ cat.characterRole }}
                </div>
                <p class="text-xs text-stone-500 dark:text-stone-400 leading-snug">
                  {{ cat.description }}
                </p>
              </div>

              <div class="relative mt-4 pt-3 border-t border-stone-900/10 dark:border-sun-300/10 flex items-center justify-between text-[11px] font-extrabold text-sun-700 dark:text-sun-300">
                <span>Open lesson</span>
                <span class="grid h-6 w-6 place-items-center rounded-lg bg-sun-100 dark:bg-sun-400/10 group-hover:translate-x-1 group-hover:bg-sun-300 group-hover:text-stone-950 transition-all">→</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Quick Preview -->
        <div *ngIf="previewPhrases().length > 0" class="mt-12" appReveal>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="font-display text-lg font-extrabold text-stone-900 dark:text-stone-100">Essential phrases preview</h2>
              <p class="text-[11px] font-semibold text-stone-500 dark:text-stone-400">A little taste before you dive in.</p>
            </div>
            <a [routerLink]="['/learn', langId(), 'essentials']" class="rounded-lg bg-sun-100 dark:bg-sun-400/10 px-2.5 py-1 text-[11px] text-sun-800 dark:text-sun-300 hover:underline font-extrabold">View all →</a>
          </div>
          <div class="bg-white dark:bg-[#161208] rounded-2xl border-2 border-stone-900/10 dark:border-sun-300/10 overflow-hidden">
            <div
              *ngFor="let phrase of previewPhrases(); let i = index"
              class="flex items-center gap-4 px-4 py-3.5 border-b border-stone-900/10 dark:border-sun-300/10 last:border-0 hover:bg-sun-50 dark:hover:bg-sun-400/5 group transition-colors"
            >
              <span class="text-[10px] font-mono font-bold text-stone-300 dark:text-stone-600 w-5 shrink-0 text-right">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-stone-900 dark:text-stone-100 text-sm" [dir]="lang()?.script_direction">{{ phrase.native }}</div>
                <div class="text-[11px] font-mono text-sun-700 dark:text-sun-300 mt-0.5">{{ phrase.phonetic }}</div>
                <div class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{{ phrase.translation }}</div>
              </div>
              <button
                (click)="speak(phrase)"
                class="w-9 h-9 rounded-xl border-2 border-stone-900/10 dark:border-sun-300/15 bg-sun-50 dark:bg-sun-400/10 text-stone-600 dark:text-stone-300 hover:bg-sun-300 hover:text-stone-950 hover:border-stone-950 flex items-center justify-center transition-all shrink-0 active:scale-90"
                aria-label="Play pronunciation"
              >
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- NEXT STEP BANNER -->
        <div class="mt-12 p-6 rounded-3xl border-2 border-stone-950 bg-gradient-to-r from-sun-300 via-amber-300 to-orange-300 text-stone-950 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[6px_6px_0_0_#1c1917] dark:border-sun-200 dark:shadow-[6px_6px_0_0_rgba(255,226,77,0.8)]">
          <div class="space-y-1 text-center sm:text-left">
            <div class="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-widest text-stone-800">
              <span>🚀</span> Ready for the next stage?
            </div>
            <h3 class="font-display font-extrabold text-xl">Test your accent in the Interactive Studio</h3>
            <p class="text-xs font-semibold text-stone-800/80 max-w-lg">
              Use your microphone to speak with native voice frequency analysis, practice spaced repetition flashcards, and master grammar constituents.
            </p>
          </div>
          <div class="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              [routerLink]="auth.isAuthenticated() ? '/studio' : '/onboarding'"
              class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-stone-950 hover:bg-stone-800 text-sun-300 font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Launch Studio Exercises</span>
              <span>→</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class PhrasebookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phraseService = inject(PhraseService);
  private tts = inject(TextToSpeechService);
  public sfx = inject(AudioSfxService);
  public auth = inject(AuthService);

  public langId = signal<string>('es');
  public allLanguages = SUPPORTED_LANGUAGES;
  public langMenuOpen = false;
  public lang = computed(() => SUPPORTED_LANGUAGES.find(l => l.id === this.langId()) || SUPPORTED_LANGUAGES[0]);
  public categories = computed(() => this.phraseService.getCategoriesForLanguage(this.langId()));
  public totalPhrases = computed(() => this.phraseService.getTotalPhraseCount(this.langId()));
  public previewPhrases = computed(() => this.phraseService.getPhrasesForCategory(this.langId(), 'essentials').slice(0, 6));

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('langId');
      if (id) {
        const validLang = SUPPORTED_LANGUAGES.find(l => l.id === id);
        if (validLang) {
          this.langId.set(id);
        } else {
          this.router.navigate(['/welcome']);
        }
      }
    });
  }

  speak(phrase: { native: string }) {
    this.sfx.playCardFlip();
    const locale = this.lang()?.locale_code || 'en-US';
    this.tts.speak(phrase.native, locale);
  }
}
