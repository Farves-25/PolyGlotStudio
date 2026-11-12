import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PhraseService, Phrase, PHRASE_CATEGORIES } from '../../core/services/phrase.service';
import { SUPPORTED_LANGUAGES } from '../../core/services/language.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { ToastService } from '../../core/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-phrase-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-[#0C0A05] text-slate-900 dark:text-white transition-colors">

      <!-- TOP NAV -->
      <nav class="sticky top-0 z-30 bg-white/95 dark:bg-[#0C0A05]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3 text-sm">
          <div class="flex items-center gap-2 min-w-0">
            <!-- Back to All Topics -->
            <a [routerLink]="['/learn', langId()]" class="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 shrink-0 text-xs font-bold" title="Back to All Topics">
              <span>←</span>
              <span>All Topics</span>
            </a>
            <span class="text-slate-300 dark:text-slate-700">›</span>
            <span class="font-extrabold text-slate-800 dark:text-slate-200 truncate text-xs sm:text-sm flex items-center gap-1.5">
              <span>{{ categoryInfo()?.icon }}</span>
              <span>{{ categoryInfo()?.name }}</span>
            </span>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Prev/Next quick links in header -->
            <div class="hidden md:flex items-center gap-1">
              <a
                *ngIf="prevCategory()"
                [routerLink]="['/learn', langId(), prevCategory()?.id]"
                class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400"
                [title]="'Previous: ' + prevCategory()?.name"
              >
                ‹ Prev
              </a>
              <a
                *ngIf="nextCategory()"
                [routerLink]="['/learn', langId(), nextCategory()?.id]"
                class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400"
                [title]="'Next: ' + nextCategory()?.name"
              >
                Next ›
              </a>
            </div>

            <!-- Mode Switcher Pill -->
            <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                (click)="viewMode.set('carousel')"
                class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5"
                [ngClass]="viewMode() === 'carousel'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
              >
                <span>🎬</span> <span class="hidden sm:inline">Comic Story</span>
              </button>
              <button
                (click)="viewMode.set('list')"
                class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5"
                [ngClass]="viewMode() === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
              >
                <span>📋</span> <span class="hidden sm:inline">Table</span>
              </button>
            </div>

            <!-- Start Quiz Button -->
            <a
              [routerLink]="['/quiz', langId(), categoryId()]"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
            >
              <span>⚡</span> Quiz
            </a>
          </div>
        </div>
      </nav>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        <!-- CATEGORY BANNER WITH CHARACTER (Loecsen signature) -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 mb-6 shadow-xs relative overflow-hidden">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
            <div class="flex items-center gap-4">
              <!-- Animated cartoon character avatar -->
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-sm animate-float shrink-0 select-none"
                   [ngClass]="categoryInfo()?.badgeBg">
                {{ categoryInfo()?.characterEmoji }}
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                    {{ lang()?.name }} · {{ categoryInfo()?.characterRole }}
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500 font-mono">
                    {{ phrases().length }} expressions
                  </span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {{ categoryInfo()?.name }}
                </h1>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {{ categoryInfo()?.description }}
                </p>
              </div>
            </div>

            <!-- Quick Auto-Play All Feature -->
            <button
              (click)="toggleAutoPlay()"
              class="w-full sm:w-auto px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 transform active:scale-95"
              [ngClass]="isAutoPlaying()
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'"
            >
              <span>{{ isAutoPlaying() ? '⏸ Pause Continuous Play' : '▶ Play All Phrases' }}</span>
            </button>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- VIEW MODE 1: COMIC STORY CAROUSEL (Loecsen Inspired)        -->
        <!-- ============================================================ -->
        <div *ngIf="viewMode() === 'carousel'" class="space-y-6">

          <!-- The Big Interactive Comic Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-lg relative overflow-hidden transition-all">

            <!-- Card Top Bar: Index & Speed Controls -->
            <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-mono font-bold">
                  Phrase {{ activeIndex() + 1 }} of {{ phrases().length }}
                </span>
                <span *ngIf="isAutoPlaying()" class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                  <span>●</span> Auto-Advancing
                </span>
              </div>

              <!-- Speed Toggle -->
              <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  (click)="toggleSlow()"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                  [ngClass]="tts.isSlow() ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50 font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
                  [attr.aria-pressed]="tts.isSlow()"
                  title="Toggle slow pronunciation (0.75x)"
                >
                  <span>🐢</span> Slow
                </button>
                <button
                  (click)="setNormalSpeed()"
                  class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                  [ngClass]="!tts.isSlow() ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
                  title="Natural conversation speed (1.0x)"
                >
                  <span>🐰</span> Normal
                </button>
              </div>
            </div>

            <!-- Comic Dialogue Box -->
            <div class="flex flex-col md:flex-row items-center gap-6 my-4">

              <!-- Character speaking avatar -->
              <div class="flex flex-col items-center shrink-0">
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/60 dark:to-purple-950/60 border-2 border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-5xl sm:text-6xl shadow-md select-none transform transition-transform"
                     [class.scale-105]="isPlayingActive()">
                  {{ categoryInfo()?.characterEmoji }}
                </div>
                <span class="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  {{ categoryInfo()?.characterRole }}
                </span>
              </div>

              <!-- The Comic Speech Bubble -->
              <div class="flex-1 w-full bg-slate-50 dark:bg-slate-800/70 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-700/80 relative speech-bubble speech-bubble-left transition-all"
                   [class.ring-2]="isPlayingActive()"
                   [class.ring-indigo-500]="isPlayingActive()">

                <div class="flex items-start justify-between gap-3">
                  <div class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-2">
                    {{ lang()?.name }} Expression
                  </div>
                  <button
                    (click)="copyPhrase(activePhrase())"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                    title="Copy phrase"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </button>
                </div>

                <!-- Big Native Target Phrase -->
                <div
                  class="font-extrabold text-slate-900 dark:text-white mb-2 leading-tight tracking-tight select-all"
                  [dir]="lang()?.script_direction"
                  [class.text-3xl]="lang()?.script_direction !== 'rtl'"
                  [class.text-4xl]="lang()?.script_direction === 'rtl'"
                >
                  {{ activePhrase()?.native }}
                </div>

                <!-- Phonetic IPA -->
                <div class="text-xs sm:text-sm font-mono text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                  {{ activePhrase()?.phonetic }}
                </div>

                <!-- Translation Divider & Text -->
                <div class="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div class="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                    "{{ activePhrase()?.translation }}"
                  </div>
                </div>
              </div>
            </div>

            <!-- Audio Player Bar with Animated Waveform (Loecsen Signature) -->
            <div class="mt-6 p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <button
                  (click)="playActiveAudio()"
                  class="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-all transform active:scale-95 shrink-0"
                  title="Listen to native voice"
                >
                  <svg *ngIf="!isPlayingActive()" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <svg *ngIf="isPlayingActive()" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>

                <div>
                  <div class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Listen Native Speaker</span>
                    <span class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">({{ speechRate }}x speed)</span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">
                    Native authentic pronunciation stream
                  </div>
                </div>
              </div>

              <!-- Equalizer animation bars -->
              <div class="flex items-end gap-1 h-6 px-4 py-1 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700">
                <span class="w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                      [ngClass]="isPlayingActive() ? 'eq-bar-1' : 'h-1.5'"></span>
                <span class="w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                      [ngClass]="isPlayingActive() ? 'eq-bar-2' : 'h-3'"></span>
                <span class="w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                      [ngClass]="isPlayingActive() ? 'eq-bar-3' : 'h-2'"></span>
                <span class="w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                      [ngClass]="isPlayingActive() ? 'eq-bar-4' : 'h-4'"></span>
              </div>
            </div>

            <!-- Carousel Navigation Controls -->
            <div class="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                (click)="prevPhrase()"
                [disabled]="activeIndex() === 0"
                class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-xs text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <span>←</span>
                <span>Previous</span>
              </button>

              <!-- Progress Dots -->
              <div class="hidden sm:flex items-center gap-1.5 max-w-[200px] overflow-hidden">
                <span
                  *ngFor="let p of phrases(); let idx = index"
                  (click)="goToPhrase(idx)"
                  class="w-2 h-2 rounded-full cursor-pointer transition-all"
                  [ngClass]="idx === activeIndex() ? 'w-5 bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-400'"
                ></span>
              </div>

              <button
                (click)="nextPhrase()"
                [disabled]="activeIndex() >= phrases().length - 1"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-xs text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Next Phrase</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ============================================================ -->
        <!-- VIEW MODE 2: TABLE LIST VIEW                                -->
        <!-- ============================================================ -->
        <div *ngIf="viewMode() === 'list'" class="space-y-4">

          <!-- Search Filter -->
          <div class="relative">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch($event)"
              placeholder="Search in {{ categoryInfo()?.name }} expressions..."
              class="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-colors"
            />
          </div>

          <!-- Phrase Table Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div class="grid grid-cols-[2.5rem_1fr_1fr_4.5rem] gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-mono uppercase text-slate-400 font-bold">
              <div>#</div>
              <div>{{ lang()?.name }} & Phonetics</div>
              <div>English Meaning</div>
              <div class="text-right">Audio</div>
            </div>

            <!-- Phrase Rows -->
            <div
              *ngFor="let phrase of filteredPhrases(); let i = index"
              class="grid grid-cols-[2.5rem_1fr_1fr_4.5rem] gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 group transition-all items-center"
              [class.bg-indigo-50/60]="playingId() === phrase.id"
              [class.dark:bg-indigo-950/20]="playingId() === phrase.id"
            >
              <div class="text-xs font-mono text-slate-400 dark:text-slate-500 font-semibold">{{ i + 1 }}</div>

              <div>
                <div
                  class="font-bold text-slate-900 dark:text-white leading-tight"
                  [dir]="lang()?.script_direction"
                  [class.text-right]="lang()?.script_direction === 'rtl'"
                  [class.text-base]="lang()?.script_direction === 'rtl'"
                  [class.text-sm]="lang()?.script_direction !== 'rtl'"
                >
                  {{ phrase.native }}
                </div>
                <div class="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                  {{ phrase.phonetic }}
                </div>
              </div>

              <div class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                {{ phrase.translation }}
              </div>

              <!-- Audio Play Buttons (Slow Toggle + Play) -->
              <div class="flex items-center justify-end gap-1.5">
                <!-- Slow 🐢 -->
                <button
                  (click)="toggleSlow()"
                  class="w-7 h-7 rounded-xl border text-xs flex items-center justify-center transition-all active:scale-90"
                  [ngClass]="tts.isSlow()
                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400/50 scale-105 opacity-100 font-bold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100'"
                  [attr.aria-pressed]="tts.isSlow()"
                  title="Toggle slow playback (0.75x)"
                >
                  🐢
                </button>
                <!-- Play -->
                <button
                  (click)="speak(phrase)"
                  class="w-8 h-8 rounded-xl border flex items-center justify-center transition-all transform active:scale-90"
                  [ngClass]="playingId() === phrase.id
                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 dark:ring-indigo-800 scale-105'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600'"
                  title="Play pronunciation"
                >
                  <div *ngIf="playingId() === phrase.id" class="flex items-end gap-0.5 h-3">
                    <span class="w-0.5 bg-white rounded-full eq-bar-1"></span>
                    <span class="w-0.5 bg-white rounded-full eq-bar-2"></span>
                    <span class="w-0.5 bg-white rounded-full eq-bar-3"></span>
                  </div>
                  <svg *ngIf="playingId() !== phrase.id" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </div>

            <!-- Empty Search State -->
            <div *ngIf="filteredPhrases().length === 0" class="text-center py-16 text-slate-400">
              <div class="text-4xl mb-2">🔍</div>
              <div class="text-sm font-semibold">No phrases found for "{{ searchQuery }}"</div>
            </div>
          </div>
        </div>

        <!-- TOPIC NAVIGATION & PROGRESSION BAR -->
        <div class="mt-8 space-y-4">
          <!-- Quiz Prompt Banner -->
          <div class="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-indigo-200 font-bold">
                <span>⚡</span> Step 2: Reinforce with Quiz
              </div>
              <h3 class="font-extrabold text-base mt-0.5">Ready to test what you've learned?</h3>
              <p class="text-xs text-indigo-100 mt-0.5">
                Practice with audio match, word unscramble, and spaced repetition flashcards.
              </p>
            </div>
            <a
              [routerLink]="['/quiz', langId(), categoryId()]"
              class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 font-extrabold text-xs shadow-sm transition-all transform active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Start Topic Quiz</span>
              <span>→</span>
            </a>
          </div>

          <!-- Bottom Topic Stepper (Back / Next) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Left: Previous Topic -->
            <a
              *ngIf="prevCategory(); else allTopicsBtn"
              [routerLink]="['/learn', langId(), prevCategory()?.id]"
              class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex items-center gap-3.5 group shadow-xs"
            >
              <span class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:-translate-x-0.5 transition-transform font-bold text-sm">
                ←
              </span>
              <div class="min-w-0">
                <div class="text-[10px] uppercase font-mono font-bold text-slate-400">Previous Topic</div>
                <div class="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {{ prevCategory()?.icon }} {{ prevCategory()?.name }}
                </div>
              </div>
            </a>
            <ng-template #allTopicsBtn>
              <a
                [routerLink]="['/learn', langId()]"
                class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-colors flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-xs"
              >
                <span class="text-base">←</span>
                <span>Return to All 14 Topics</span>
              </a>
            </ng-template>

            <!-- Right: Next Topic -->
            <a
              *ngIf="nextCategory(); else finishTopic"
              [routerLink]="['/learn', langId(), nextCategory()?.id]"
              class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex items-center justify-between group shadow-xs"
            >
              <div class="min-w-0">
                <div class="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400">Next Topic</div>
                <div class="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {{ nextCategory()?.icon }} {{ nextCategory()?.name }}
                </div>
              </div>
              <span class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:translate-x-0.5 transition-transform font-bold text-sm">
                →
              </span>
            </a>
            <ng-template #finishTopic>
              <a
                [routerLink]="['/learn', langId()]"
                class="p-4 rounded-2xl border-2 border-emerald-400/50 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 transition-colors flex items-center justify-between text-xs font-extrabold text-emerald-800 dark:text-emerald-300"
              >
                <span>🎉 Last topic reached! Review all categories</span>
                <span>→</span>
              </a>
            </ng-template>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PhraseListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phraseService = inject(PhraseService);
  public tts = inject(TextToSpeechService);
  public sfx = inject(AudioSfxService);
  private toast = inject(ToastService);

  public langId = signal<string>('es');
  public categoryId = signal<string>('essentials');
  public searchQuery = '';
  public playingId = signal<string | null>(null);
  public viewMode = signal<'carousel' | 'list'>('carousel');
  public activeIndex = signal<number>(0);
  public speechRate = 1.0;
  public isAutoPlaying = signal<boolean>(false);
  private autoPlayTimer: any = null;
  private speakRequestId = 0;

  public lang = computed(() => SUPPORTED_LANGUAGES.find(l => l.id === this.langId()) || SUPPORTED_LANGUAGES[0]);
  public categoryInfo = computed(() => PHRASE_CATEGORIES.find(c => c.id === this.categoryId()));
  public phrases = computed(() => this.phraseService.getPhrasesForCategory(this.langId(), this.categoryId()));
  public filteredPhrases = signal<Phrase[]>([]);

  public activePhrase = computed(() => this.phrases()[this.activeIndex()] || this.phrases()[0]);
  public isPlayingActive = computed(() => this.playingId() === this.activePhrase()?.id);

  public prevCategory = computed(() => {
    const cats = PHRASE_CATEGORIES;
    const idx = cats.findIndex(c => c.id === this.categoryId());
    if (idx <= 0) return null;
    return cats[idx - 1];
  });

  public nextCategory = computed(() => {
    const cats = PHRASE_CATEGORIES;
    const idx = cats.findIndex(c => c.id === this.categoryId());
    if (idx < 0 || idx >= cats.length - 1) return null;
    return cats[idx + 1];
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const lId = params.get('langId');
      const cId = params.get('categoryId');
      if (lId) this.langId.set(lId);
      if (cId) this.categoryId.set(cId);
      this.activeIndex.set(0);
      this.updateFiltered();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeydown);
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeydown);
    }
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (this.viewMode() === 'carousel') {
      if (e.key === 'ArrowRight') {
        this.nextPhrase();
      } else if (e.key === 'ArrowLeft') {
        this.prevPhrase();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.playActiveAudio();
      }
    }
  };

  private updateFiltered() {
    if (!this.searchQuery.trim()) {
      this.filteredPhrases.set(this.phrases());
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredPhrases.set(
        this.phrases().filter(p =>
          p.native.toLowerCase().includes(q) ||
          p.translation.toLowerCase().includes(q) ||
          p.phonetic.toLowerCase().includes(q)
        )
      );
    }
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.updateFiltered();
  }

  goToPhrase(index: number) {
    this.activeIndex.set(index);
    this.sfx.playCardFlip();
  }

  nextPhrase() {
    if (this.activeIndex() < this.phrases().length - 1) {
      this.activeIndex.update(i => i + 1);
      this.sfx.playWhoosh();
    }
  }

  prevPhrase() {
    if (this.activeIndex() > 0) {
      this.activeIndex.update(i => i - 1);
      this.sfx.playWhoosh();
    }
  }

  toggleSlow(): void {
    this.tts.toggleSlow();
    this.speechRate = this.tts.isSlow() ? 0.75 : 1.0;
    this.sfx.playCardFlip();
  }

  setNormalSpeed(): void {
    this.tts.isSlow.set(false);
    this.tts.setRate(1.0);
    this.speechRate = 1.0;
    this.sfx.playCardFlip();
  }

  playActiveAudio() {
    if (this.isPlayingActive()) {
      this.tts.stop();
      this.playingId.set(null);
      return;
    }
    const p = this.activePhrase();
    if (p) {
      this.speak(p);
    }
  }

  speak(phrase: Phrase, rate?: number) {
    if (this.playingId() === phrase.id) {
      this.tts.stop();
      this.playingId.set(null);
      return;
    }
    const locale = this.lang()?.locale_code || 'en-US';
    const effectiveRate = rate !== undefined ? rate : (this.tts.isSlow() ? 0.75 : 1.0);
    const requestId = ++this.speakRequestId;
    this.playingId.set(phrase.id);
    this.tts.speak(phrase.native, locale, effectiveRate).then(() => {
      if (requestId === this.speakRequestId) this.playingId.set(null);
    });
  }

  toggleAutoPlay() {
    if (this.isAutoPlaying()) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.isAutoPlaying.set(true);
    this.viewMode.set('carousel');
    if (this.activeIndex() >= this.phrases().length - 1) {
      this.activeIndex.set(0);
    }
    this.runAutoPlayStep();
  }

  private runAutoPlayStep() {
    if (!this.isAutoPlaying()) return;

    const p = this.activePhrase();
    if (!p) return;

    const locale = this.lang()?.locale_code || 'en-US';
    this.playingId.set(p.id);

    this.tts.speak(p.native, locale, this.speechRate).then(() => {
      this.playingId.set(null);
      if (!this.isAutoPlaying()) return;

      // Pause briefly between phrases so learner can absorb and repeat
      this.autoPlayTimer = setTimeout(() => {
        if (!this.isAutoPlaying()) return;
        if (this.activeIndex() < this.phrases().length - 1) {
          this.nextPhrase();
          this.runAutoPlayStep();
        } else {
          this.stopAutoPlay();
          this.sfx.playSuccess();
          this.toast.show('All phrases finished!', 'success');
        }
      }, 1600);
    });
  }

  stopAutoPlay() {
    this.isAutoPlaying.set(false);
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    this.tts.stop();
    this.playingId.set(null);
  }

  copyPhrase(phrase: Phrase | undefined) {
    if (!phrase || typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(`${phrase.native} - ${phrase.translation}`).then(() => {
      this.toast.show('Copied phrase to clipboard!', 'info');
    });
  }
}
