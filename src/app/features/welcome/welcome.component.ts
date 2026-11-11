import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import confetti from 'canvas-confetti';
import { ThemeService } from '../../core/services/theme.service';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { AuthService } from '../../core/services/auth.service';
import { PHRASE_CATEGORIES, PhraseCategory } from '../../core/services/phrase.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { TiltDirective } from '../../shared/directives/tilt.directive';

interface LangCard {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  accentColor: string;
  characterEmoji: string;
  scenarioTitle: string;
  phrases: number;
  categories: number;
  greeting: string;
  greetingRomanized: string;
  dir: 'ltr' | 'rtl';
  difficulty: string;
}

interface InteractiveSample {
  flag: string;
  langName: string;
  locale: string;
  dir: 'ltr' | 'rtl';
  category: string;
  characterEmoji: string;
  characterRole: string;
  native: string;
  phonetic: string;
  translation: string;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollRevealDirective, TiltDirective],
  template: `
    <div class="relative isolate min-h-screen overflow-x-hidden bg-[#FFFBF0] text-stone-900 transition-colors dark:bg-[#0C0A05] dark:text-stone-50">

      <!-- ============================================================ -->
      <!-- SUNLIT AMBIENT BACKGROUND                                    -->
      <!-- ============================================================ -->
      <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div class="absolute -left-40 -top-48 h-[36rem] w-[36rem] rounded-full bg-sun-300/45 blur-[110px] animate-blob dark:bg-sun-500/10"></div>
        <div class="absolute -right-56 top-24 h-[34rem] w-[34rem] rounded-full bg-orange-300/30 blur-[120px] animate-blob dark:bg-orange-500/10" style="animation-delay: -6s"></div>
        <div class="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-sun-200/40 blur-[120px] animate-blob dark:bg-sun-400/5" style="animation-delay: -12s"></div>
        <div class="absolute inset-0 app-grid-bg opacity-40 dark:opacity-25"></div>
      </div>

      <!-- ============================================================ -->
      <!-- NAVBAR                                                       -->
      <!-- ============================================================ -->
      <nav class="sticky top-0 z-50 border-b border-stone-900/10 bg-[#FFFBF0]/80 backdrop-blur-xl transition-colors dark:border-sun-300/10 dark:bg-[#0C0A05]/80">
        <div class="mx-auto flex h-[4.4rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          <a routerLink="/welcome" class="group flex items-center gap-3">
            <span class="relative grid h-11 w-11 place-items-center rounded-2xl border-2 border-stone-950 bg-sun-400 shadow-[3px_3px_0_0_#1c1917] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 dark:border-sun-200 dark:shadow-[3px_3px_0_0_rgba(255,226,77,0.85)]">
              <span class="text-xl">☀️</span>
              <span class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-stone-950 bg-white dark:border-sun-200"></span>
            </span>
            <span class="font-display text-xl font-extrabold tracking-tight">
              Polyglot<span class="text-sun-600 dark:text-sun-300">Studio</span>
            </span>
          </a>

          <div class="hidden items-center gap-1 rounded-full border border-stone-900/10 bg-white/60 p-1 lg:flex dark:border-sun-300/10 dark:bg-white/5">
            <a href="#languages" (click)="sfx.playCardFlip()" class="rounded-full px-4 py-2 text-xs font-bold text-stone-600 transition-all hover:bg-sun-300 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-sun-400/20 dark:hover:text-sun-200">Languages</a>
            <a href="#method" (click)="sfx.playCardFlip()" class="rounded-full px-4 py-2 text-xs font-bold text-stone-600 transition-all hover:bg-sun-300 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-sun-400/20 dark:hover:text-sun-200">How it works</a>
            <a href="#scenarios" (click)="sfx.playCardFlip()" class="rounded-full px-4 py-2 text-xs font-bold text-stone-600 transition-all hover:bg-sun-300 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-sun-400/20 dark:hover:text-sun-200">14 Scenarios</a>
            <a href="#playground" (click)="sfx.playCardFlip()" class="rounded-full px-4 py-2 text-xs font-bold text-stone-600 transition-all hover:bg-sun-300 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-sun-400/20 dark:hover:text-sun-200">Playground</a>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="theme.toggleTheme()"
              class="grid h-10 w-10 place-items-center rounded-xl border border-stone-900/10 bg-white/70 text-stone-700 transition-all hover:-rotate-12 hover:bg-sun-200 active:scale-90 dark:border-sun-300/15 dark:bg-white/5 dark:text-sun-200 dark:hover:bg-sun-400/15"
              [title]="theme.theme() === 'dark' ? 'Switch to the sunny light theme' : 'Switch to the moonlight theme'"
              aria-label="Toggle color theme"
            >
              <svg *ngIf="theme.theme() === 'dark'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <svg *ngIf="theme.theme() === 'light'" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>

            <a
              *ngIf="!auth.isAuthenticated()"
              routerLink="/onboarding"
              [queryParams]="{ mode: 'signin' }"
              class="hidden rounded-xl px-3 py-2 text-xs font-bold text-stone-700 transition-colors hover:text-sun-700 sm:inline-flex dark:text-stone-300 dark:hover:text-sun-300"
            >
              Sign in
            </a>

            <a
              *ngIf="auth.isAuthenticated()"
              routerLink="/dashboard"
              class="hidden rounded-xl px-3 py-2 text-xs font-bold text-stone-700 transition-colors hover:text-sun-700 sm:inline-flex dark:text-stone-300 dark:hover:text-sun-300"
            >
              Dashboard
            </a>

            <a
              [routerLink]="auth.isAuthenticated() ? '/dashboard' : '/onboarding'"
              (click)="startOnboarding($event)"
              class="group inline-flex items-center gap-2 rounded-xl border-2 border-stone-950 bg-sun-400 px-4 py-2.5 text-xs font-extrabold text-stone-950 shadow-[3px_3px_0_0_#1c1917] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#1c1917] active:scale-95 dark:border-sun-200 dark:shadow-[3px_3px_0_0_rgba(255,226,77,0.85)]"
            >
              <span>{{ auth.isAuthenticated() ? 'Go to Studio' : 'Start free' }}</span>
              <span class="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>
      </nav>

      <!-- ============================================================ -->
      <!-- HERO                                                         -->
      <!-- ============================================================ -->
      <section
        class="hero-aura relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20"
        (mousemove)="onHeroMove($event)"
      >
        <div class="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">

          <!-- LEFT: Copy -->
          <div class="relative z-10 text-center lg:text-left">
            <div class="inline-flex animate-pop items-center gap-2 rounded-full border border-sun-600/30 bg-sun-100 px-4 py-1.5 text-[11px] font-extrabold text-sun-800 shadow-sm dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sun-500 opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-sun-500"></span>
              </span>
              <span>420+ real-life phrases · native voices · zero textbook fog</span>
            </div>

            <h1 class="mt-6 font-display text-[2.7rem] font-extrabold leading-[0.98] tracking-tight text-stone-950 dark:text-cream sm:text-6xl lg:text-[4.25rem]">
              Learn a language<br class="hidden sm:block" />
              that <span class="marker-highlight">actually sticks.</span>
            </h1>

            <p class="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg lg:mx-0">
              Bite-sized phrases for real adventures — cafés, taxis, temples, and 2 a.m. conversations. Listen, speak, and let our sunny memory engine do the boring part.
            </p>

            <div class="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
              <a
                routerLink="/onboarding"
                (click)="startOnboarding($event)"
                class="group inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-stone-950 bg-sun-400 px-7 py-4 text-sm font-extrabold text-stone-950 shadow-[6px_6px_0_0_#1c1917] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-sun-300 hover:shadow-[3px_3px_0_0_#1c1917] active:scale-[0.98] dark:border-sun-200 dark:shadow-[6px_6px_0_0_rgba(255,226,77,0.85)]"
              >
                <span>Start learning free</span>
                <span class="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>

              <button
                type="button"
                (click)="testPronunciationSample()"
                class="group inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-stone-900/15 bg-white/80 px-6 py-4 text-sm font-extrabold text-stone-800 transition-all hover:border-stone-950 hover:bg-white active:scale-[0.98] dark:border-sun-300/20 dark:bg-white/5 dark:text-stone-100 dark:hover:border-sun-300/50 dark:hover:bg-white/10"
              >
                <span class="grid h-8 w-8 place-items-center rounded-full bg-sun-300 text-stone-950 transition-transform group-hover:scale-110 dark:bg-sun-400">
                  <svg class="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </span>
                <span>Hear a live phrase</span>
              </button>
            </div>

            <!-- Social proof -->
            <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <div class="flex -space-x-3">
                <span class="grid h-10 w-10 place-items-center rounded-full border-2 border-[#FFFBF0] bg-sun-200 text-lg shadow-sm dark:border-[#0C0A05] dark:bg-sun-400/20">🦊</span>
                <span class="grid h-10 w-10 place-items-center rounded-full border-2 border-[#FFFBF0] bg-orange-200 text-lg shadow-sm dark:border-[#0C0A05] dark:bg-orange-400/20">🐼</span>
                <span class="grid h-10 w-10 place-items-center rounded-full border-2 border-[#FFFBF0] bg-sun-300 text-lg shadow-sm dark:border-[#0C0A05] dark:bg-sun-400/25">🐨</span>
                <span class="grid h-10 w-10 place-items-center rounded-full border-2 border-[#FFFBF0] bg-white text-[10px] font-extrabold text-stone-800 shadow-sm dark:border-[#0C0A05] dark:bg-white/10 dark:text-sun-200">12k+</span>
              </div>
              <div class="text-center sm:text-left">
                <div class="flex items-center justify-center gap-1 text-sun-500 sm:justify-start">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  <span class="ml-1 text-xs font-bold text-stone-700 dark:text-stone-300">4.9 / 5</span>
                </div>
                <p class="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Loved by curious humans in 42 countries</p>
              </div>
            </div>

            <!-- Mini stats -->
            <div class="mt-9 grid grid-cols-3 gap-2 border-t border-stone-900/10 pt-5 dark:border-sun-300/10">
              <div>
                <div class="font-display text-2xl font-extrabold text-stone-950 dark:text-sun-300">6</div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Languages</div>
              </div>
              <div class="border-x border-stone-900/10 px-2 dark:border-sun-300/10">
                <div class="font-display text-2xl font-extrabold text-stone-950 dark:text-sun-300">420+</div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Phrases</div>
              </div>
              <div>
                <div class="font-display text-2xl font-extrabold text-stone-950 dark:text-sun-300">14</div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Life scenes</div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Interactive pocket phrasebook -->
          <div id="playground" class="relative mx-auto w-full max-w-[30rem] lg:max-w-none" (mouseenter)="demoHovered.set(true)" (mouseleave)="demoHovered.set(false)">

            <!-- Sun disc -->
            <div class="pointer-events-none absolute -top-8 left-1/2 h-[25rem] w-[25rem] -translate-x-1/2 rounded-full sunburst-bg opacity-80 animate-spin-slow sm:h-[29rem] sm:w-[29rem]"></div>
            <div class="pointer-events-none absolute -top-2 left-1/2 h-[17rem] w-[17rem] -translate-x-1/2 rounded-full border-2 border-sun-500/20 bg-sun-300/30 blur-sm dark:border-sun-300/10 dark:bg-sun-500/10"></div>

            <!-- Floating sticker: streak -->
            <div class="absolute -right-2 -top-3 z-20 flex rotate-6 items-center gap-2 rounded-2xl border-2 border-stone-950 bg-white px-3 py-2 shadow-[4px_4px_0_0_#1c1917] animate-float dark:border-sun-200 dark:bg-[#1D1709] dark:shadow-[4px_4px_0_0_rgba(255,226,77,0.85)] sm:-right-6">
              <span class="text-lg animate-flame">🔥</span>
              <div class="leading-tight">
                <div class="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Streak</div>
                <div class="text-sm font-extrabold">12 days</div>
              </div>
            </div>

            <!-- Floating sticker: XP -->
            <div class="absolute -bottom-5 -left-2 z-20 flex -rotate-6 items-center gap-2 rounded-2xl border-2 border-stone-950 bg-sun-300 px-3 py-2 shadow-[4px_4px_0_0_#1c1917] animate-float-reverse dark:border-sun-200 dark:shadow-[4px_4px_0_0_rgba(255,226,77,0.85)] sm:-left-8">
              <span class="text-lg">⚡</span>
              <div class="leading-tight">
                <div class="text-[10px] font-bold uppercase tracking-wider text-stone-700">Just earned</div>
                <div class="text-sm font-extrabold text-stone-950">+120 XP</div>
              </div>
            </div>

            <!-- Main card -->
            <div
              appTilt
              [tiltMax]="4"
              [tiltScale]="1.012"
              class="tilt-wrap tilt-shine relative z-10 overflow-hidden rounded-[2rem] border-2 border-stone-950/90 bg-white shadow-[12px_12px_0_0_#F5B800] transition-shadow dark:border-sun-200/70 dark:bg-[#161208] dark:shadow-[12px_12px_0_0_rgba(255,210,30,0.9)]"
            >
              <!-- Card header -->
              <div class="flex items-center justify-between gap-3 border-b-2 border-stone-950/10 bg-sun-300 px-5 py-3 text-stone-950 dark:border-sun-200/20 dark:bg-sun-400">
                <div class="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em]">
                  <span class="h-2 w-2 rounded-full bg-stone-950 animate-pulse"></span>
                  Pocket phrasebook
                </div>
                <span class="rounded-full border border-stone-950/20 bg-white/40 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">Live demo</span>
              </div>

              <!-- Language tabs -->
              <div class="flex gap-1.5 overflow-x-auto border-b border-stone-900/10 bg-sun-50 px-3 py-2.5 dark:border-sun-300/10 dark:bg-white/[0.03]">
                <button
                  *ngFor="let sample of samples; let i = index"
                  type="button"
                  (click)="selectSample(i)"
                  class="flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold transition-all duration-200"
                  [ngClass]="activeSampleIndex() === i
                    ? 'bg-stone-950 text-sun-300 shadow-sm -translate-y-0.5'
                    : 'text-stone-600 hover:bg-sun-200/70 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-sun-400/15 dark:hover:text-sun-200'"
                >
                  <span class="text-sm">{{ sample.flag }}</span>
                  <span>{{ sample.langName }}</span>
                </button>
              </div>

              <!-- Character + phrase -->
              <div class="relative px-5 pb-5 pt-6">
                <div class="flex items-start justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
                  <span class="rounded-md bg-sun-100 px-2 py-0.5 text-sun-800 dark:bg-sun-400/10 dark:text-sun-200">{{ activeSample().category }}</span>
                  <span class="text-stone-400 dark:text-stone-500">{{ activeSample().langName }}</span>
                </div>

                <div class="mt-4 flex items-start gap-4" [class.animate-phrase-in]="phraseAnimated()">
                  <div class="relative shrink-0">
                    <div class="grid h-16 w-16 place-items-center rounded-2xl border-2 border-stone-950/10 bg-sun-100 text-4xl animate-bob dark:border-sun-300/15 dark:bg-sun-400/10">
                      {{ activeSample().characterEmoji }}
                    </div>
                    <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-stone-900/10 bg-white px-2 py-0.5 text-[8px] font-mono font-bold text-stone-500 dark:border-sun-300/10 dark:bg-[#231C0C] dark:text-stone-400">
                      {{ activeSample().characterRole }}
                    </span>
                  </div>

                  <div class="min-w-0 flex-1">
                    <p
                      class="font-display text-[1.45rem] font-extrabold leading-tight text-stone-950 dark:text-cream"
                      [dir]="activeSample().dir"
                      [class.text-3xl]="activeSample().dir === 'rtl'"
                    >
                      {{ activeSample().native }}
                    </p>
                    <p class="mt-1.5 font-phonetic text-[11px] font-semibold text-sun-700 dark:text-sun-300">
                      {{ activeSample().phonetic }}
                    </p>
                  </div>
                </div>

                <div class="mt-5 flex items-start gap-2.5 rounded-2xl border border-stone-900/10 bg-sun-50 p-3 dark:border-sun-300/10 dark:bg-white/[0.04]">
                  <span class="mt-0.5 text-sm">💬</span>
                  <p class="text-xs font-semibold leading-relaxed text-stone-700 dark:text-stone-300">
                    "{{ activeSample().translation }}"
                  </p>
                </div>

                <!-- Audio controls -->
                <div class="mt-5 flex items-center justify-between gap-3 border-t border-stone-900/10 pt-4 dark:border-sun-300/10">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="playSample()"
                      class="flex items-center gap-2 rounded-xl bg-stone-950 px-3.5 py-2 text-[11px] font-extrabold text-sun-300 transition-all hover:bg-stone-800 active:scale-95 dark:bg-sun-400 dark:text-stone-950 dark:hover:bg-sun-300"
                    >
                      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Play native
                    </button>
                    <button
                      type="button"
                      (click)="toggleSlow()"
                      class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition-all active:scale-95"
                      [ngClass]="tts.isSlow()
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/50 scale-105 font-black dark:bg-indigo-500 dark:text-white dark:border-indigo-400'
                        : 'border-stone-900/10 bg-white text-stone-600 hover:bg-sun-100 hover:text-stone-950 dark:border-sun-300/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-sun-400/15'"
                      [attr.aria-pressed]="tts.isSlow()"
                      title="Toggle slow pronunciation mode"
                    >
                      <span>🐢 Slow</span>
                      <span *ngIf="tts.isSlow()" class="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                    </button>
                  </div>

                  <!-- Equalizer -->
                  <div class="flex h-6 items-end gap-1 rounded-lg bg-sun-100 px-2.5 py-1.5 dark:bg-sun-400/10">
                    <span class="w-1 rounded-full bg-sun-600 dark:bg-sun-400" [ngClass]="isPlayingSample() ? 'eq-bar-1' : 'h-1'"></span>
                    <span class="w-1 rounded-full bg-sun-600 dark:bg-sun-400" [ngClass]="isPlayingSample() ? 'eq-bar-2' : 'h-2.5'"></span>
                    <span class="w-1 rounded-full bg-sun-600 dark:bg-sun-400" [ngClass]="isPlayingSample() ? 'eq-bar-3' : 'h-1.5'"></span>
                    <span class="w-1 rounded-full bg-sun-600 dark:bg-sun-400" [ngClass]="isPlayingSample() ? 'eq-bar-4' : 'h-3'"></span>
                    <span class="w-1 rounded-full bg-sun-600 dark:bg-sun-400" [ngClass]="isPlayingSample() ? 'eq-bar-2' : 'h-2'"></span>
                  </div>
                </div>

                @if (tts.lastError()) {
                  <p class="mt-3 flex items-start gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[10px] font-bold leading-relaxed text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                    <span aria-hidden="true">⚠️</span>
                    <span>{{ tts.lastError() }} Try Chrome or Edge, or enable a system voice in your OS settings.</span>
                  </p>
                }

                <div class="mt-3 flex items-center justify-between">
                  <p class="text-[10px] font-semibold text-stone-400 dark:text-stone-500">
                    Tap a language. Hear the accent. No pressure.
                  </p>
                  <div class="flex gap-1.5">
                    <button type="button" (click)="prevSample()" aria-label="Previous phrase" class="grid h-7 w-7 place-items-center rounded-lg border border-stone-900/10 bg-white text-xs font-bold text-stone-500 transition-colors hover:bg-sun-200 hover:text-stone-950 dark:border-sun-300/10 dark:bg-white/5 dark:text-stone-400 dark:hover:bg-sun-400/15">←</button>
                    <button type="button" (click)="nextSample()" aria-label="Next phrase" class="grid h-7 w-7 place-items-center rounded-lg border border-stone-900/10 bg-white text-xs font-bold text-stone-500 transition-colors hover:bg-sun-200 hover:text-stone-950 dark:border-sun-300/10 dark:bg-white/5 dark:text-stone-400 dark:hover:bg-sun-400/15">→</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tiny "app is typing" chip -->
            <div class="absolute -bottom-10 right-3 z-20 hidden items-center gap-1.5 rounded-full border border-stone-900/10 bg-white px-3 py-1.5 text-[10px] font-bold text-stone-500 shadow-sm dark:border-sun-300/10 dark:bg-[#1D1709] dark:text-stone-400 sm:flex">
              <span class="h-1.5 w-1.5 rounded-full bg-sun-500 animate-pulse"></span>
              Auto-previewing phrases
            </div>
          </div>
        </div>

        <div class="mt-16 flex justify-center">
          <a href="#languages" class="group flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 transition-colors hover:text-sun-700 dark:text-stone-500 dark:hover:text-sun-300">
            <span>Scroll for sunshine</span>
            <span class="animate-bob text-lg">↓</span>
          </a>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- MARQUEE STRIP                                                -->
      <!-- ============================================================ -->
      <div class="relative -rotate-1 border-y-2 border-stone-950/80 bg-sun-400 py-3 text-stone-950 shadow-[0_8px_0_0_rgba(28,25,23,0.08)] dark:border-sun-200/50">
        <div class="marquee-mask overflow-hidden">
          <div class="marquee-track items-center gap-6 font-display text-sm font-extrabold uppercase tracking-[0.14em] sm:text-base">
            <ng-container *ngFor="let word of marqueeWords">
              <span class="whitespace-nowrap">{{ word }}</span>
              <span class="text-sun-700">✦</span>
            </ng-container>
            <ng-container *ngFor="let word of marqueeWords">
              <span class="whitespace-nowrap">{{ word }}</span>
              <span class="text-sun-700">✦</span>
            </ng-container>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- LANGUAGES                                                    -->
      <!-- ============================================================ -->
      <section id="languages" class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div class="mx-auto max-w-2xl text-center" appReveal>
          <span class="inline-flex items-center gap-2 rounded-full border border-sun-600/25 bg-sun-100 px-3.5 py-1 text-[10px] font-mono font-extrabold uppercase tracking-[0.18em] text-sun-800 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200">
            <span>🌍</span> Pick your adventure
          </span>
          <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-stone-950 dark:text-cream sm:text-5xl">
            Six languages.<br class="sm:hidden" /> Endless sunny detours.
          </h2>
          <p class="mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-stone-600 dark:text-stone-400">
            Every course is a pocket-sized travel companion: 14 real-life situations, native audio, and a memory loop that feels like a game.
          </p>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <a
            *ngFor="let lang of languages; let i = index"
            [href]="'#languages'"
            (click)="startLanguage($event, lang.id)"
            appTilt
            [tiltMax]="5"
            [appRevealDelay]="i * 70"
            appReveal
            class="tilt-wrap tilt-shine group relative flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border-2 border-stone-900/10 bg-white p-5 transition-all duration-300 hover:border-stone-950 hover:shadow-[8px_8px_0_0_#FFD21E] dark:border-sun-300/10 dark:bg-[#161208] dark:hover:border-sun-300/50 dark:hover:shadow-[8px_8px_0_0_rgba(255,210,30,0.7)]"
          >
            <div class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sun-300 via-sun-400 to-orange-400"></div>
            <div class="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sun-200/50 blur-2xl transition-all duration-500 group-hover:scale-150 dark:bg-sun-400/10"></div>

            <div class="relative flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="grid h-14 w-14 place-items-center rounded-2xl border border-stone-900/10 bg-sun-100 text-3xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 dark:border-sun-300/10 dark:bg-sun-400/10">
                  {{ lang.flag }}
                </div>
                <div>
                  <h3 class="font-display text-lg font-extrabold leading-tight text-stone-950 transition-colors group-hover:text-sun-700 dark:text-cream dark:group-hover:text-sun-300">
                    {{ lang.name }}
                  </h3>
                  <p class="text-xs font-semibold text-stone-500 dark:text-stone-400" [dir]="lang.dir">{{ lang.nativeName }}</p>
                </div>
              </div>
              <span class="text-2xl select-none animate-float-reverse" style="animation-delay: -1.5s">{{ lang.characterEmoji }}</span>
            </div>

            <div class="relative mt-4 flex items-center gap-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-sun-700 dark:text-sun-300">🗺️ {{ lang.scenarioTitle }}</span>
            </div>

            <div class="relative mt-3 rounded-2xl border border-stone-900/10 bg-sun-50 p-3.5 dark:border-sun-300/10 dark:bg-white/[0.04]">
              <p class="text-sm font-bold text-stone-900 dark:text-stone-100" [dir]="lang.dir">{{ lang.greeting }}</p>
              <p class="mt-0.5 text-[11px] font-medium text-stone-500 dark:text-stone-400">{{ lang.greetingRomanized }}</p>
            </div>

            <div class="relative mt-4 flex items-center justify-between border-t border-stone-900/10 pt-3.5 dark:border-sun-300/10">
              <div class="flex items-center gap-2 text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400">
                <span>{{ lang.phrases }}+ phrases</span>
                <span class="text-sun-500">•</span>
                <span>{{ lang.difficulty }}</span>
              </div>
              <span class="inline-flex items-center gap-1 rounded-lg bg-sun-100 px-2.5 py-1 text-[10px] font-extrabold text-sun-800 transition-all group-hover:gap-2 group-hover:bg-sun-300 group-hover:text-stone-950 dark:bg-sun-400/10 dark:text-sun-200">
                Start <span>→</span>
              </span>
            </div>
          </a>
        </div>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-2" appReveal>
          <span class="mr-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Brewing next:</span>
          <span *ngFor="let cs of comingSoon" class="inline-flex items-center gap-1.5 rounded-full border border-dashed border-stone-900/15 bg-white/60 px-3 py-1.5 text-[11px] font-bold text-stone-500 transition-colors hover:border-sun-500 hover:text-stone-800 dark:border-sun-300/15 dark:bg-white/5 dark:text-stone-400">
            <span>{{ cs.flag }}</span> {{ cs.name }}
          </span>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- METHOD                                                       -->
      <!-- ============================================================ -->
      <section id="method" class="relative border-y border-stone-900/10 bg-white/70 py-20 dark:border-sun-300/10 dark:bg-white/[0.02] sm:py-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-2xl text-center" appReveal>
            <span class="inline-flex items-center gap-2 rounded-full border border-sun-600/25 bg-sun-100 px-3.5 py-1 text-[10px] font-mono font-extrabold uppercase tracking-[0.18em] text-sun-800 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200">
              <span>✨</span> The sunshine method
            </span>
            <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-stone-950 dark:text-cream sm:text-5xl">
              Three little steps.<br class="sm:hidden" /> One big glow-up.
            </h2>
            <p class="mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed text-stone-600 dark:text-stone-400">
              No grammar labyrinth. No 40-minute lectures. Just enough structure to make real conversations feel easy.
            </p>
          </div>

          <div class="relative mt-14 grid gap-5 md:grid-cols-3">
            <div class="pointer-events-none absolute left-[16%] right-[16%] top-14 hidden border-t-2 border-dashed border-sun-500/40 md:block dark:border-sun-300/20"></div>

            <div class="relative z-10 flex flex-col items-center rounded-[1.75rem] border-2 border-stone-900/10 bg-[#FFFBF0] p-7 text-center transition-all duration-300 hover:-translate-y-2 hover:border-stone-950 hover:shadow-[8px_8px_0_0_#FFD21E] dark:border-sun-300/10 dark:bg-[#161208] dark:hover:border-sun-300/50 dark:hover:shadow-[8px_8px_0_0_rgba(255,210,30,0.7)]" appReveal>
              <div class="grid h-16 w-16 place-items-center rounded-2xl border-2 border-stone-950 bg-sun-300 text-3xl shadow-[4px_4px_0_0_#1c1917] animate-float dark:border-sun-200 dark:shadow-[4px_4px_0_0_rgba(255,226,77,0.8)]">🗺️</div>
              <div class="mt-5 text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] text-sun-700 dark:text-sun-300">Step 01</div>
              <h3 class="mt-1 font-display text-lg font-extrabold text-stone-950 dark:text-cream">Pick a life scene</h3>
              <p class="mt-2 text-xs font-medium leading-relaxed text-stone-600 dark:text-stone-400">
                Hotel, taxi, café, emergency, first date. Choose the moment you actually want to survive.
              </p>
            </div>

            <div class="relative z-10 flex flex-col items-center rounded-[1.75rem] border-2 border-stone-900/10 bg-[#FFFBF0] p-7 text-center transition-all duration-300 hover:-translate-y-2 hover:border-stone-950 hover:shadow-[8px_8px_0_0_#FFD21E] dark:border-sun-300/10 dark:bg-[#161208] dark:hover:border-sun-300/50 dark:hover:shadow-[8px_8px_0_0_rgba(255,210,30,0.7)]" [appRevealDelay]="120" appReveal>
              <div class="grid h-16 w-16 place-items-center rounded-2xl border-2 border-stone-950 bg-orange-300 text-3xl shadow-[4px_4px_0_0_#1c1917] animate-float-reverse dark:border-sun-200 dark:shadow-[4px_4px_0_0_rgba(255,226,77,0.8)]">🎧</div>
              <div class="mt-5 text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] text-orange-700 dark:text-orange-300">Step 02</div>
              <h3 class="mt-1 font-display text-lg font-extrabold text-stone-950 dark:text-cream">Listen &amp; echo</h3>
              <p class="mt-2 text-xs font-medium leading-relaxed text-stone-600 dark:text-stone-400">
                Hear a native voice at full speed or turtle speed, then copy the melody out loud. That's it.
              </p>
            </div>

            <div class="relative z-10 flex flex-col items-center rounded-[1.75rem] border-2 border-stone-900/10 bg-[#FFFBF0] p-7 text-center transition-all duration-300 hover:-translate-y-2 hover:border-stone-950 hover:shadow-[8px_8px_0_0_#FFD21E] dark:border-sun-300/10 dark:bg-[#161208] dark:hover:border-sun-300/50 dark:hover:shadow-[8px_8px_0_0_rgba(255,210,30,0.7)]" [appRevealDelay]="240" appReveal>
              <div class="grid h-16 w-16 place-items-center rounded-2xl border-2 border-stone-950 bg-sun-300 text-3xl shadow-[4px_4px_0_0_#1c1917] animate-float dark:border-sun-200 dark:shadow-[4px_4px_0_0_rgba(255,226,77,0.8)]">⚡</div>
              <div class="mt-5 text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] text-sun-700 dark:text-sun-300">Step 03</div>
              <h3 class="mt-1 font-display text-lg font-extrabold text-stone-950 dark:text-cream">Let it stick</h3>
              <p class="mt-2 text-xs font-medium leading-relaxed text-stone-600 dark:text-stone-400">
                The SM-2 memory engine resurfaces phrases right before you forget. Sneaky. Effective. Slightly magical.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- SCENARIOS                                                    -->
      <!-- ============================================================ -->
      <section id="scenarios" class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div appReveal>
            <span class="inline-flex items-center gap-2 rounded-full border border-sun-600/25 bg-sun-100 px-3.5 py-1 text-[10px] font-mono font-extrabold uppercase tracking-[0.18em] text-sun-800 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200">
              <span>🎟️</span> Real-life scenes
            </span>
            <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-stone-950 dark:text-cream sm:text-5xl">
              14 situations.<br /> One confident you.
            </h2>
            <p class="mt-3 max-w-md text-sm font-medium leading-relaxed text-stone-600 dark:text-stone-400">
              Tap a scene to peek inside. Each one is a tiny pocket adventure with the exact phrases locals actually use.
            </p>
            <div class="mt-6 flex items-center gap-3">
              <div class="flex -space-x-2">
                <span class="grid h-8 w-8 place-items-center rounded-full border-2 border-[#FFFBF0] bg-sun-200 text-sm dark:border-[#0C0A05]">🧑‍🍳</span>
                <span class="grid h-8 w-8 place-items-center rounded-full border-2 border-[#FFFBF0] bg-orange-200 text-sm dark:border-[#0C0A05]">🚕</span>
                <span class="grid h-8 w-8 place-items-center rounded-full border-2 border-[#FFFBF0] bg-sun-300 text-sm dark:border-[#0C0A05]">🏨</span>
                <span class="grid h-8 w-8 place-items-center rounded-full border-2 border-[#FFFBF0] bg-white text-[9px] font-extrabold text-stone-600 dark:border-[#0C0A05] dark:bg-white/10 dark:text-stone-300">+10</span>
              </div>
              <p class="text-[11px] font-bold text-stone-500 dark:text-stone-400">From "un café" to "help!"</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            <button
              *ngFor="let cat of categories; let i = index"
              type="button"
              (click)="previewCategory(cat)"
              [appRevealDelay]="i * 35"
              appReveal
              class="group relative overflow-hidden rounded-2xl border border-stone-900/10 bg-white p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-stone-950 hover:bg-sun-100 hover:shadow-[4px_4px_0_0_#1c1917] active:scale-95 dark:border-sun-300/10 dark:bg-[#161208] dark:hover:border-sun-300/50 dark:hover:bg-sun-400/10 dark:hover:shadow-[4px_4px_0_0_rgba(255,210,30,0.7)]"
            >
              <div class="text-2xl transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125">{{ cat.icon }}</div>
              <div class="mt-2 text-[11px] font-extrabold leading-tight text-stone-900 dark:text-stone-100">{{ cat.name }}</div>
              <div class="mt-1 text-[9px] font-mono font-semibold text-sun-700 dark:text-sun-300">{{ cat.characterRole }}</div>
            </button>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- BENTO FEATURES                                               -->
      <!-- ============================================================ -->
      <section class="relative overflow-hidden border-y border-stone-900/10 bg-white/70 py-20 dark:border-sun-300/10 dark:bg-white/[0.02] sm:py-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-2xl text-center" appReveal>
            <span class="inline-flex items-center gap-2 rounded-full border border-sun-600/25 bg-sun-100 px-3.5 py-1 text-[10px] font-mono font-extrabold uppercase tracking-[0.18em] text-sun-800 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200">
              <span>🎮</span> Built for dopamine
            </span>
            <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-stone-950 dark:text-cream sm:text-5xl">
              Learning that feels<br class="sm:hidden" /> a little bit illegal.
            </h2>
          </div>

          <div class="mt-12 grid gap-5 lg:grid-cols-3">
            <!-- Big speech card -->
            <div class="relative overflow-hidden rounded-[2rem] border-2 border-stone-950/80 bg-stone-950 p-7 text-cream shadow-[8px_8px_0_0_#F5B800] dark:border-sun-200/60 dark:bg-[#161208] dark:shadow-[8px_8px_0_0_rgba(255,210,30,0.8)] sm:p-9 lg:col-span-2" appReveal>
              <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sun-400/20 blur-3xl"></div>
              <div class="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                <div class="max-w-md">
                  <span class="inline-flex items-center gap-1.5 rounded-full border border-sun-300/25 bg-sun-400/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-sun-300">
                    <span class="h-1.5 w-1.5 rounded-full bg-sun-300 animate-pulse"></span> Speech engine
                  </span>
                  <h3 class="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                    Speak. Wobble.<br />
                    <span class="text-sun-300">Nail it anyway.</span>
                  </h3>
                  <p class="mt-3 text-sm font-medium leading-relaxed text-stone-300">
                    Live waveform, syllable-level feedback, and a friendly accuracy score. Pronunciation practice without the sweaty palms.
                  </p>
                  <button type="button" (click)="sfx.playSuccess()" class="mt-6 inline-flex items-center gap-2 rounded-xl bg-sun-400 px-4 py-2.5 text-xs font-extrabold text-stone-950 transition-transform hover:scale-105 active:scale-95">
                    <span>🎙️</span> Try the mic
                  </button>
                </div>

                <div class="flex flex-col items-center gap-3">
                  <div class="flex h-24 items-end gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <span class="w-2 rounded-full bg-sun-300 eq-bar-1"></span>
                    <span class="w-2 rounded-full bg-sun-400 eq-bar-2"></span>
                    <span class="w-2 rounded-full bg-orange-400 eq-bar-3"></span>
                    <span class="w-2 rounded-full bg-sun-300 eq-bar-4"></span>
                    <span class="w-2 rounded-full bg-sun-400 eq-bar-1"></span>
                    <span class="w-2 rounded-full bg-orange-400 eq-bar-2"></span>
                    <span class="w-2 rounded-full bg-sun-300 eq-bar-3"></span>
                    <span class="w-2 rounded-full bg-sun-400 eq-bar-4"></span>
                    <span class="w-2 rounded-full bg-orange-400 eq-bar-1"></span>
                  </div>
                  <div class="rounded-xl border border-sun-300/20 bg-sun-400/10 px-4 py-2 text-center">
                    <div class="font-display text-2xl font-extrabold text-sun-300">94%</div>
                    <div class="text-[9px] font-mono uppercase tracking-wider text-stone-400">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Flashcard -->
            <div class="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border-2 border-stone-950/80 bg-sun-300 p-7 text-stone-950 shadow-[8px_8px_0_0_#1c1917] dark:border-sun-200/60 dark:bg-sun-400 dark:shadow-[8px_8px_0_0_rgba(255,226,77,0.85)]" appReveal>
              <div class="pointer-events-none absolute -right-8 -top-8 text-[8rem] opacity-15 transition-transform duration-700 group-hover:rotate-12">🃏</div>
              <div class="relative">
                <span class="rounded-full border border-stone-950/20 bg-white/40 px-2.5 py-1 text-[9px] font-mono font-extrabold uppercase tracking-wider">SM-2 memory engine</span>
                <div class="mt-5 rounded-2xl border-2 border-stone-950/15 bg-white/70 p-5 transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-[1.02]">
                  <div class="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">Spanish · Noun</div>
                  <div class="mt-1 font-display text-2xl font-extrabold">el viaje</div>
                  <div class="mt-1 font-phonetic text-[11px] font-semibold text-stone-600">[el ˈbja.xe]</div>
                  <div class="mt-4 border-t border-stone-950/10 pt-3 text-sm font-bold">the trip, the journey</div>
                </div>
              </div>
              <div class="relative mt-5 flex items-center justify-between text-[10px] font-mono font-extrabold uppercase tracking-wider">
                <span>Hover to peek</span>
                <span class="transition-transform duration-300 group-hover:translate-x-1">Flip →</span>
              </div>
            </div>

            <!-- Streak card -->
            <div class="relative overflow-hidden rounded-[2rem] border-2 border-stone-900/10 bg-[#FFFBF0] p-7 dark:border-sun-300/10 dark:bg-[#161208]" appReveal>
              <div class="flex items-center justify-between">
                <div>
                  <span class="rounded-full border border-sun-600/20 bg-sun-100 px-2.5 py-1 text-[9px] font-mono font-extrabold uppercase tracking-wider text-sun-800 dark:border-sun-300/20 dark:bg-sun-400/10 dark:text-sun-200">Daily streak</span>
                  <div class="mt-4 flex items-end gap-2">
                    <span class="font-display text-5xl font-extrabold text-stone-950 dark:text-cream">12</span>
                    <span class="pb-1 text-sm font-bold text-stone-500 dark:text-stone-400">days</span>
                  </div>
                  <p class="text-xs font-semibold text-stone-500 dark:text-stone-400">of tiny wins</p>
                </div>
                <span class="text-5xl animate-flame">🔥</span>
              </div>
              <div class="mt-6 grid grid-cols-7 gap-1.5">
                <span *ngFor="let d of weekDots; let i = index" class="aspect-square rounded-md" [ngClass]="i < 5 ? 'bg-sun-400' : 'bg-sun-100 dark:bg-sun-400/10'"></span>
              </div>
              <p class="mt-3 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">One phrase is enough.</p>
            </div>

            <!-- Roleplay card -->
            <div class="relative overflow-hidden rounded-[2rem] border-2 border-stone-900/10 bg-[#FFFBF0] p-7 dark:border-sun-300/10 dark:bg-[#161208] lg:col-span-2" appReveal>
              <div class="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <span class="rounded-full border border-orange-600/20 bg-orange-100 px-2.5 py-1 text-[9px] font-mono font-extrabold uppercase tracking-wider text-orange-800 dark:border-orange-300/20 dark:bg-orange-400/10 dark:text-orange-200">AI dialogue arena</span>
                  <h3 class="mt-4 font-display text-2xl font-extrabold text-stone-950 dark:text-cream">Practice the awkward stuff.</h3>
                  <p class="mt-2 max-w-sm text-xs font-medium leading-relaxed text-stone-600 dark:text-stone-400">
                    Ordering, complaining, flirting, surviving a Parisian waiter. Roleplay it first, live it later.
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <div class="rounded-2xl rounded-br-sm border border-stone-900/10 bg-white px-3.5 py-2.5 text-[11px] font-bold text-stone-700 shadow-sm dark:border-sun-300/10 dark:bg-white/5 dark:text-stone-200">
                    "Une table pour deux, s'il vous plaît."
                  </div>
                  <div class="grid h-10 w-10 place-items-center rounded-full border-2 border-stone-950 bg-sun-300 text-lg dark:border-sun-200">🥐</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- FINAL CTA                                                    -->
      <!-- ============================================================ -->
      <section class="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div class="relative overflow-hidden rounded-[2.5rem] border-2 border-stone-950 bg-sun-400 px-6 py-14 text-center text-stone-950 shadow-[10px_10px_0_0_#1c1917] dark:border-sun-200 dark:shadow-[10px_10px_0_0_rgba(255,226,77,0.85)] sm:px-12 sm:py-20" appReveal>
          <div class="pointer-events-none absolute inset-0 sunburst-bg opacity-70"></div>
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-sun-600/20"></div>

          <div class="pointer-events-none absolute left-5 top-6 text-3xl animate-float sm:left-10 sm:text-4xl">✈️</div>
          <div class="pointer-events-none absolute right-6 top-8 text-3xl animate-float-reverse sm:right-14 sm:text-4xl">🥐</div>
          <div class="pointer-events-none absolute bottom-8 left-10 text-3xl animate-float-reverse sm:left-20 sm:text-4xl">🌮</div>
          <div class="pointer-events-none absolute bottom-6 right-8 text-3xl animate-float sm:right-24 sm:text-4xl">🍵</div>

          <div class="relative mx-auto max-w-3xl">
            <span class="inline-flex items-center gap-2 rounded-full border border-stone-950/20 bg-white/40 px-3.5 py-1 text-[10px] font-mono font-extrabold uppercase tracking-[0.2em]">
              <span>☀️</span> Your sunny era starts here
            </span>
            <h2 class="mt-5 font-display text-[2.4rem] font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
              Your next adventure<br class="hidden sm:block" /> starts with <span class="underline-squiggle">hola.</span>
            </h2>
            <p class="mx-auto mt-5 max-w-lg text-sm font-semibold leading-relaxed text-stone-800 sm:text-base">
              Six languages, one ridiculously friendly studio. Start with a single phrase today — no credit card, no guilt, no 47-step signup.
            </p>

            <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                routerLink="/onboarding"
                (click)="startOnboarding($event)"
                class="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-stone-950 bg-stone-950 px-8 py-4 text-sm font-extrabold text-sun-300 shadow-[5px_5px_0_0_rgba(255,255,255,0.5)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(255,255,255,0.5)] active:scale-[0.98] sm:w-auto">
                <span>Start free</span>
                <span class="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
              <a href="#playground" class="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-stone-950/25 bg-white/40 px-7 py-4 text-sm font-extrabold text-stone-900 transition-colors hover:bg-white/70 sm:w-auto">
                🎧 Try a phrase first
              </a>
            </div>

            <p class="mt-4 text-[11px] font-bold text-stone-700/80">No card. No spam. Just sunshine and small wins.</p>
          </div>
        </div>
      </section>

      <!-- ============================================================ -->
      <!-- FOOTER                                                       -->
      <!-- ============================================================ -->
      <footer class="border-t border-stone-900/10 bg-white/60 dark:border-sun-300/10 dark:bg-white/[0.02]">
        <div class="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
          <div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <a routerLink="/welcome" class="group flex items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-2xl border-2 border-stone-950 bg-sun-400 text-lg shadow-[3px_3px_0_0_#1c1917] transition-transform group-hover:rotate-6 dark:border-sun-200 dark:shadow-[3px_3px_0_0_rgba(255,226,77,0.8)]">☀️</span>
              <div>
                <div class="font-display text-base font-extrabold text-stone-950 dark:text-cream">PolyglotStudio</div>
                <div class="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Speak the world, one sunny phrase at a time.</div>
              </div>
            </a>

            <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-stone-600 dark:text-stone-400">
              <a routerLink="/learn/es" class="transition-colors hover:text-sun-700 dark:hover:text-sun-300">Spanish</a>
              <a routerLink="/learn/fr" class="transition-colors hover:text-sun-700 dark:hover:text-sun-300">French</a>
              <a routerLink="/learn/ja" class="transition-colors hover:text-sun-700 dark:hover:text-sun-300">Japanese</a>
              <a routerLink="/learn/ar" class="transition-colors hover:text-sun-700 dark:hover:text-sun-300">Arabic</a>
              <a routerLink="/dashboard" class="transition-colors hover:text-sun-700 dark:hover:text-sun-300">Studio</a>
            </div>
          </div>

          <div class="flex flex-col items-center justify-between gap-3 border-t border-stone-900/10 pt-6 text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:border-sun-300/10 dark:text-stone-500 sm:flex-row">
            <span>© {{ currentYear }} PolyglotStudio · Made with sunshine &amp; caffeine</span>
            <span class="flex items-center gap-3">
              <span>Angular Signals</span>
              <span class="text-sun-500">•</span>
              <span>Web Audio</span>
              <span class="text-sun-500">•</span>
              <span>SM-2 Memory</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class WelcomeComponent implements OnInit, OnDestroy {
  public theme = inject(ThemeService);
  public tts = inject(TextToSpeechService);
  public sfx = inject(AudioSfxService);
  public auth = inject(AuthService);
  private router = inject(Router);

  public activeSampleIndex = signal<number>(0);
  public isPlayingSample = signal<boolean>(false);
  public demoHovered = signal<boolean>(false);
  public phraseAnimated = signal<boolean>(true);
  public currentYear = new Date().getFullYear();

  public categories = PHRASE_CATEGORIES;
  public weekDots = [0, 1, 2, 3, 4, 5, 6];

  public marqueeWords = [
    'Hola', 'Bonjour', 'こんにちは', 'مرحبا', 'Vanakkam', 'Guten Tag',
    'Ciao', 'Olá', '안녕하세요', '你好', 'Привет', 'Cześć',
  ];

  private rotateTimer?: ReturnType<typeof setInterval>;
  private animationTimer?: ReturnType<typeof setTimeout>;
  private speakTimer?: ReturnType<typeof setTimeout>;
  private sampleRequestId = 0;

  public samples: InteractiveSample[] = [
    { flag: '🇪🇸', langName: 'Spanish', locale: 'es-ES', dir: 'ltr', category: 'Restaurant', characterEmoji: '🧑‍🍳', characterRole: 'Madrid chef', native: 'Una mesa para dos, por favor.', phonetic: '[ˈu.na ˈme.sa ˈpa.ɾa dos poɾ faˈβoɾ]', translation: 'A table for two, please.' },
    { flag: '🇫🇷', langName: 'French', locale: 'fr-FR', dir: 'ltr', category: 'Bar & Café', characterEmoji: '🥐', characterRole: 'Paris baker', native: 'L\'addition, s\'il vous plaît.', phonetic: '[la.di.sjɔ̃ sil vu plɛ]', translation: 'The bill, please.' },
    { flag: '🇩🇪', langName: 'German', locale: 'de-DE', dir: 'ltr', category: 'Transport', characterEmoji: '🚕', characterRole: 'Berlin cabbie', native: 'Wo ist der nächste Bahnhof?', phonetic: '[voː ɪst deːɐ̯ ˈnɛçstə ˈbaːnhoːf]', translation: 'Where is the nearest train station?' },
    { flag: '🇯🇵', langName: 'Japanese', locale: 'ja-JP', dir: 'ltr', category: 'Hotel', characterEmoji: '🛎️', characterRole: 'Kyoto host', native: 'チェックインをお願いします。', phonetic: '[tɕe.kɯ.iɴ o o.ne.gai ɕi.ma.sɯ]', translation: 'I would like to check in, please.' },
    { flag: '🇸🇦', langName: 'Arabic', locale: 'ar-SA', dir: 'rtl', category: 'Hospitality', characterEmoji: '☕', characterRole: 'Cairo merchant', native: 'أَهْلًا وَسَهْلًا، كَيْفَ حَالُكَ؟', phonetic: '[ʔah.lan wa.sah.lan, kajfa ħaːluk]', translation: 'Welcome, how are you?' },
    { flag: '🇮🇳', langName: 'Tamil', locale: 'ta-IN', dir: 'ltr', category: 'Essentials', characterEmoji: '🍛', characterRole: 'Chennai guide', native: 'வணக்கம், இது எவ்வளவு?', phonetic: '[va.ɳak.kam, i.d̪u ev.va.ɭa.vu]', translation: 'Hello, how much is this?' },
  ];

  public activeSample = () => this.samples[this.activeSampleIndex()];

  public languages: LangCard[] = [
    { id: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', accentColor: '#f59e0b', characterEmoji: '💃', scenarioTitle: 'Flamenco, tapas & plaza life', phrases: 420, categories: 14, greeting: '¡Hola! ¿Cómo estás hoy?', greetingRomanized: 'Hello! How are you today?', dir: 'ltr', difficulty: 'Beginner' },
    { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', accentColor: '#eab308', characterEmoji: '🥐', scenarioTitle: 'Boulangeries, cafés & metros', phrases: 420, categories: 14, greeting: 'Bonjour, comment allez-vous ?', greetingRomanized: 'Hello, how are you?', dir: 'ltr', difficulty: 'Moderate' },
    { id: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', accentColor: '#d97706', characterEmoji: '🥨', scenarioTitle: 'Bahnhof, pretzels & precision', phrases: 420, categories: 14, greeting: 'Guten Tag, wie geht es Ihnen?', greetingRomanized: 'Good day, how are you?', dir: 'ltr', difficulty: 'Moderate' },
    { id: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', accentColor: '#fb923c', characterEmoji: '🏯', scenarioTitle: 'Ryokan, ramen & shinkansen', phrases: 420, categories: 14, greeting: 'こんにちは、お元気ですか？', greetingRomanized: 'Konnichiwa, o-genki desu ka?', dir: 'ltr', difficulty: 'Challenging' },
    { id: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', accentColor: '#f5b800', characterEmoji: '🌴', scenarioTitle: 'Bazaars, hospitality & RTL script', phrases: 420, categories: 14, greeting: 'أَهْلًا وَسَهْلًا، كَيْفَ حَالُكَ؟', greetingRomanized: 'Ahlan wa sahlan, kayfa halak?', dir: 'rtl', difficulty: 'Explorer' },
    { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', accentColor: '#ea580c', characterEmoji: '🍛', scenarioTitle: 'Heritage temples & filter coffee', phrases: 420, categories: 14, greeting: 'வணக்கம், நீங்கள் நலமா?', greetingRomanized: 'Vanakkam, neengal nalama?', dir: 'ltr', difficulty: 'Challenging' },
  ];

  public comingSoon = [
    { flag: '🇵🇹', name: 'Portuguese' },
    { flag: '🇮🇹', name: 'Italian' },
    { flag: '🇰🇷', name: 'Korean' },
    { flag: '🇨🇳', name: 'Mandarin' },
    { flag: '🇷🇺', name: 'Russian' },
    { flag: '🇵🇱', name: 'Polish' },
  ];

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    this.rotateTimer = setInterval(() => {
      if (!this.demoHovered() && !this.isPlayingSample()) {
        this.advanceSample(1);
      }
    }, 6800);
  }

  ngOnDestroy(): void {
    if (this.rotateTimer) clearInterval(this.rotateTimer);
    if (this.animationTimer) clearTimeout(this.animationTimer);
    if (this.speakTimer) clearTimeout(this.speakTimer);
  }

  selectSample(idx: number): void {
    if (idx === this.activeSampleIndex()) {
      this.playSample();
      return;
    }

    this.activeSampleIndex.set(idx);
    this.restartPhraseAnimation();
    this.sfx.playCardFlip();
    this.scheduleSampleAudio();
  }

  nextSample(): void {
    this.advanceSample(1);
    this.sfx.playCardFlip();
    this.scheduleSampleAudio();
  }

  prevSample(): void {
    this.advanceSample(-1);
    this.sfx.playCardFlip();
    this.scheduleSampleAudio();
  }

  toggleSlow(): void {
    this.tts.toggleSlow();
    this.sfx.playCardFlip();
  }

  playSample(rate?: number): void {
    const sample = this.activeSample();
    const effectiveRate = rate !== undefined ? rate : (this.tts.isSlow() ? 0.75 : 1.0);
    // Rapid clicks restart playback; only the newest request may reset the
    // equalizer/playing UI, otherwise it gets stuck in the "playing" state.
    const requestId = ++this.sampleRequestId;
    this.isPlayingSample.set(true);
    this.tts
      .speak(sample.native, sample.locale, effectiveRate)
      .then(() => {
        if (requestId === this.sampleRequestId) this.isPlayingSample.set(false);
      })
      .catch(() => {
        if (requestId === this.sampleRequestId) this.isPlayingSample.set(false);
      });
  }

  testPronunciationSample(): void {
    this.sfx.playWhoosh();
    this.playSample();
  }

  startLanguage(event: Event, langId: string): void {
    event.preventDefault();
    this.sfx.playLevelUp();
    this.burst(0.55);
    setTimeout(() => this.router.navigate(['/learn', langId]), 220);
  }

  startOnboarding(event: Event): void {
    event.preventDefault();
    this.sfx.playLevelUp();
    this.burst(0.7);
    const target = this.auth.isAuthenticated() ? '/dashboard' : '/onboarding';
    setTimeout(() => this.router.navigate([target]), 320);
  }

  previewCategory(cat: PhraseCategory): void {
    this.sfx.playCardFlip();
    this.router.navigate(['/learn', 'es', cat.id]);
  }

  onHeroMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }

  private advanceSample(direction: number): void {
    const total = this.samples.length;
    this.activeSampleIndex.set((this.activeSampleIndex() + direction + total) % total);
    this.restartPhraseAnimation();
  }

  private scheduleSampleAudio(): void {
    if (this.speakTimer) clearTimeout(this.speakTimer);
    this.speakTimer = setTimeout(() => this.playSample(), 90);
  }

  private restartPhraseAnimation(): void {
    this.phraseAnimated.set(false);
    if (this.animationTimer) clearTimeout(this.animationTimer);
    this.animationTimer = setTimeout(() => this.phraseAnimated.set(true), 30);
  }

  private burst(originY: number): void {
    const colors = ['#FFD21E', '#FFE24D', '#F5B800', '#FB923C', '#FFFFFF', '#1C1917'];
    confetti({
      particleCount: 110,
      spread: 78,
      startVelocity: 34,
      gravity: 0.9,
      scalar: 1.05,
      ticks: 190,
      origin: { x: 0.5, y: originY },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 45,
      spread: 120,
      startVelocity: 22,
      gravity: 0.7,
      scalar: 0.7,
      ticks: 150,
      origin: { x: 0.5, y: originY },
      colors,
      disableForReducedMotion: true,
    });
  }
}
