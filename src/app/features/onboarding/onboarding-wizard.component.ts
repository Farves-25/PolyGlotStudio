import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import confetti from 'canvas-confetti';

interface OnboardingOption {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#FFFBF0] dark:bg-[#0C0A05] text-slate-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-sun-300 selection:text-stone-950 transition-colors">
      
      <!-- TOP NAVIGATION BAR WITH PROGRESS INDICATOR -->
      <header class="w-full h-16 border-b border-stone-900/10 dark:border-sun-300/10 bg-[#FFFBF0]/80 dark:bg-[#0C0A05]/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        
        <!-- Left: Back Button or Brand -->
        <div class="flex items-center gap-3">
          <button
            *ngIf="currentStep() > 1 && !isAuthStepOnly"
            (click)="prevStep()"
            class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors text-xs font-semibold flex items-center gap-1.5"
          >
            <span>←</span>
            <span class="hidden sm:inline">Back</span>
          </button>

          <a *ngIf="currentStep() === 1 || isAuthStepOnly" routerLink="/welcome" class="group flex items-center gap-2 text-stone-600 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white transition-colors text-xs font-bold">
            <span class="grid h-8 w-8 place-items-center rounded-xl border-2 border-stone-950 bg-sun-400 text-sm shadow-[2px_2px_0_0_#1c1917] transition-transform group-hover:-rotate-6 dark:border-sun-200 dark:shadow-[2px_2px_0_0_rgba(255,226,77,0.8)]">☀️</span>
            <span class="hidden sm:inline">PolyglotStudio</span>
          </a>
        </div>

        <!-- Center: Progress Steps Bar -->
        <div class="flex-1 max-w-xs sm:max-w-md mx-4">
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 mb-1.5">
            <span>Step {{ currentStep() }} of {{ totalSteps }}</span>
            <span class="font-bold text-sun-700 dark:text-sun-300">{{ getStepTitle() }}</span>
          </div>
          <div class="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              class="bg-sun-500 dark:bg-sun-400 h-full rounded-full transition-all duration-300"
              [style.width.%]="(currentStep() / totalSteps) * 100"
            ></div>
          </div>
        </div>

        <!-- Right: Theme Switcher -->
        <button
          (click)="theme.toggleTheme()"
          class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors border border-slate-200 dark:border-zinc-800"
          [title]="theme.theme() === 'dark' ? 'Switch to Light' : 'Switch to Dark'"
        >
          <svg *ngIf="theme.theme() === 'dark'" class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg *ngIf="theme.theme() === 'light'" class="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </header>

      <!-- MAIN WIZARD BODY -->
      <main class="relative flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn overflow-hidden">
        <div class="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sun-300/40 blur-[90px] dark:bg-sun-400/10"></div>
        <div class="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-orange-300/30 blur-[100px] dark:bg-orange-400/10"></div>
        <div class="relative w-full max-w-2xl">
          
          <!-- ================= STEP 1: CHOOSE TARGET LANGUAGE ================= -->
          <div *ngIf="currentStep() === 1" class="space-y-6">
            <div class="text-center max-w-lg mx-auto">
              <h2 class="font-display text-2xl sm:text-3xl font-extrabold text-stone-950 dark:text-cream tracking-tight">
                Which language do you want to learn?
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5">
                Select your target tongue. You can add more languages anytime later.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                *ngFor="let l of langService.languages()"
                (click)="selectLanguage(l.id)"
                class="p-4 rounded-2xl surface-card text-left transition-all hover:scale-[1.01] active:scale-[0.99] border group flex items-center justify-between"
                [ngClass]="selectedLanguageId === l.id
                  ? 'border-sun-500 ring-2 ring-sun-500/20 bg-sun-100/60 dark:bg-sun-400/10'
                  : 'hover:border-sun-400 dark:hover:border-zinc-700'"
              >
                <div class="flex items-center gap-3.5">
                  <span class="text-3xl select-none group-hover:scale-110 transition-transform">{{ l.flag_emoji }}</span>
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white text-base">
                      {{ l.name }}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      {{ l.native_name }}
                    </div>
                  </div>
                </div>

                <div class="text-right">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold"
                    [ngClass]="l.script_direction === 'rtl' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'"
                  >
                    {{ l.script_direction }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <!-- ================= STEP 2: WHY ARE YOU LEARNING? ================= -->
          <div *ngIf="currentStep() === 2" class="space-y-6">
            <div class="text-center max-w-lg mx-auto">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Why are you learning {{ getSelectedLanguageName() }}?
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5">
                We'll tailor your vocabulary and roleplay scenarios to fit your motivation.
              </p>
            </div>

            <div class="space-y-3">
              <button
                *ngFor="let opt of motivationOptions"
                (click)="selectMotivation(opt.id)"
                class="w-full p-4 rounded-2xl surface-card text-left transition-all hover:scale-[1.005] active:scale-[0.99] border group flex items-center justify-between"
                [ngClass]="selectedMotivation === opt.id
                  ? 'border-sun-500 ring-2 ring-sun-500/20 bg-sun-100/60 dark:bg-sun-400/10'
                  : 'hover:border-sun-400 dark:hover:border-zinc-700'"
              >
                <div class="flex items-center gap-4">
                  <span class="text-2xl select-none">{{ opt.icon }}</span>
                  <div>
                    <div class="font-bold text-slate-900 dark:text-white text-sm">
                      {{ opt.title }}
                    </div>
                    <div class="text-xs text-slate-500 dark:text-zinc-400">
                      {{ opt.subtitle }}
                    </div>
                  </div>
                </div>

                <div
                  class="w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                  [ngClass]="selectedMotivation === opt.id ? 'border-sun-600 bg-sun-400 text-stone-950 text-xs' : 'border-slate-300 dark:border-zinc-700'"
                >
                  <span *ngIf="selectedMotivation === opt.id">✓</span>
                </div>
              </button>
            </div>
          </div>

          <!-- ================= STEP 3: DAILY CADENCE ================= -->
          <div *ngIf="currentStep() === 3" class="space-y-6">
            <div class="text-center max-w-lg mx-auto">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                What is your daily learning goal?
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5">
                Consistency is key to permanent language retention. You can change this anytime.
              </p>
            </div>

            <div class="space-y-3">
              <button
                *ngFor="let cadence of cadenceOptions"
                (click)="selectCadence(cadence.minutes)"
                class="w-full p-4 rounded-2xl surface-card text-left transition-all hover:scale-[1.005] active:scale-[0.99] border group flex items-center justify-between"
                [ngClass]="selectedMinutes === cadence.minutes
                  ? 'border-sun-500 ring-2 ring-sun-500/20 bg-sun-100/60 dark:bg-sun-400/10'
                  : 'hover:border-sun-400 dark:hover:border-zinc-700'"
              >
                <div class="flex items-center gap-4">
                  <span class="text-2xl select-none">{{ cadence.icon }}</span>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900 dark:text-white text-sm">{{ cadence.title }}</span>
                      <span *ngIf="cadence.recommended" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sun-100 dark:bg-sun-400/10 text-sun-800 dark:text-sun-300 border border-sun-600/20 dark:border-sun-300/20">
                        Recommended
                      </span>
                    </div>
                    <div class="text-xs text-slate-500 dark:text-zinc-400">
                      {{ cadence.subtitle }}
                    </div>
                  </div>
                </div>

                <span class="font-mono font-bold text-sm text-sun-700 dark:text-sun-300">
                  {{ cadence.minutes }} min/day
                </span>
              </button>
            </div>
          </div>

          <!-- ================= STEP 4: STARTING POINT ================= -->
          <div *ngIf="currentStep() === 4" class="space-y-6">
            <div class="text-center max-w-lg mx-auto">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Where should we start?
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5">
                Choose your current comfort level with {{ getSelectedLanguageName() }}.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                *ngFor="let level of levelOptions"
                (click)="selectLevel(level.id)"
                class="p-5 rounded-2xl surface-card text-left transition-all hover:scale-[1.01] active:scale-[0.99] border group flex flex-col justify-between"
                [ngClass]="selectedLevel === level.id
                  ? 'border-sun-500 ring-2 ring-sun-500/20 bg-sun-100/60 dark:bg-sun-400/10'
                  : 'hover:border-sun-400 dark:hover:border-zinc-700'"
              >
                <div>
                  <span class="text-3xl mb-3 block select-none">{{ level.icon }}</span>
                  <div class="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    {{ level.title }}
                  </div>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {{ level.subtitle }}
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-mono text-sun-700 dark:text-sun-300 font-bold uppercase">
                  {{ level.cefrTag }}
                </div>
              </button>
            </div>
          </div>

          <!-- ================= STEP 5: AUTHENTICATION / PROFILE CREATION ================= -->
          <div *ngIf="currentStep() === 5" class="space-y-6 max-w-lg mx-auto">
            <div class="text-center">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {{ authMode === 'signup' ? 'Create your learner profile' : 'Welcome back to PolyglotStudio' }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5">
                {{ authMode === 'signup' ? 'Save your progress, maintain your daily streak, and sync across devices.' : 'Sign in to resume your daily streak and flashcard reviews.' }}
              </p>
            </div>

            <div class="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-xl space-y-5">
              
              <!-- Tab Switcher: Sign Up vs Sign In -->
              <div class="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  (click)="authMode = 'signup'"
                  class="flex-1 py-1.5 rounded-lg transition-all"
                  [ngClass]="authMode === 'signup' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  (click)="authMode = 'signin'"
                  class="flex-1 py-1.5 rounded-lg transition-all"
                  [ngClass]="authMode === 'signin' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'"
                >
                  Sign In
                </button>
              </div>

              <!-- Social Auth Provider (Google) -->
              <div class="space-y-2.5">
                <!-- Google -->
                <button
                  type="button"
                  (click)="signInWithProvider('google')"
                  class="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-3 transition-colors shadow-xs"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <!-- Divider -->
              <div class="relative flex items-center justify-center">
                <div class="border-t border-slate-200 dark:border-zinc-800 w-full"></div>
                <span class="bg-white dark:bg-zinc-900 px-3 text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-500 absolute">
                  or with email
                </span>
              </div>

              <!-- Form Inputs -->
              <form (submit)="handleAuthSubmit($event)" class="space-y-3.5">
                <div *ngIf="authMode === 'signup'">
                  <label class="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="authName"
                    name="name"
                    placeholder="e.g. Alex Rivera"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF0] dark:bg-[#0C0A05] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sun-500/20 focus:border-sun-500 transition-all"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    [(ngModel)]="authEmail"
                    name="email"
                    placeholder="alex@example.com"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF0] dark:bg-[#0C0A05] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sun-500/20 focus:border-sun-500 transition-all"
                  />
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Password
                    </label>
                    <button
                      type="button"
                      (click)="showPassword = !showPassword"
                      class="text-[11px] font-mono text-sun-700 dark:text-sun-300 hover:underline"
                    >
                      {{ showPassword ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                  <input
                    [type]="showPassword ? 'text' : 'password'"
                    [(ngModel)]="authPassword"
                    name="password"
                    placeholder="••••••••"
                    required
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFBF0] dark:bg-[#0C0A05] border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sun-500/20 focus:border-sun-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  [disabled]="auth.isLoading()"
                  class="w-full mt-2 py-3 px-4 rounded-xl border-2 border-stone-950 bg-sun-400 hover:bg-sun-300 disabled:opacity-50 text-stone-950 font-extrabold text-xs shadow-[3px_3px_0_0_#1c1917] transition-all transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#1c1917] active:scale-95 flex items-center justify-center gap-2"
                >
                  <span *ngIf="auth.isLoading()" class="w-3.5 h-3.5 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin"></span>
                  <span>{{ authMode === 'signup' ? 'Create Account & Start Learning →' : 'Sign In & Resume Learning →' }}</span>
                </button>
              </form>

              <!-- Guest Mode Frictionless Bypass -->
              <div class="pt-2 text-center border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  (click)="handleGuestAccess()"
                  class="text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-sun-700 dark:hover:text-sun-300 transition-colors"
                >
                  Skip for now • <strong>Continue as Guest (Instant Access)</strong>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- BOTTOM WIZARD CONTROLS (Only visible on steps 1-4) -->
      <footer *ngIf="currentStep() < 5" class="w-full border-t border-stone-900/10 dark:border-sun-300/10 py-4 px-6 bg-[#FFFBF0]/85 dark:bg-[#0C0A05]/85 backdrop-blur-xl transition-colors">
        <div class="max-w-2xl mx-auto flex items-center justify-between">
          <div class="text-xs text-stone-500 dark:text-stone-400">
            Selected: <strong class="text-stone-900 dark:text-stone-100">{{ getSelectedLanguageName() }}</strong>
          </div>

          <button
            (click)="nextStep()"
            class="px-6 py-2.5 rounded-xl border-2 border-stone-950 bg-sun-400 hover:bg-sun-300 text-stone-950 text-xs font-extrabold shadow-[3px_3px_0_0_#1c1917] transition-all transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#1c1917] active:scale-95 flex items-center gap-2 dark:border-sun-200 dark:shadow-[3px_3px_0_0_rgba(255,226,77,0.8)]"
          >
            <span>Continue</span>
            <span>→</span>
          </button>
        </div>
      </footer>
    </div>
  `
})
export class OnboardingWizardComponent implements OnInit {
  public langService = inject(LanguageService);
  public auth = inject(AuthService);
  public theme = inject(ThemeService);
  private toast = inject(ToastService);
  private sfx = inject(AudioSfxService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public currentStep = signal<number>(1);
  public totalSteps = 5;
  public isAuthStepOnly = false;

  public selectedLanguageId = 'es';
  public selectedMotivation = 'travel';
  public selectedMinutes = 15;
  public selectedLevel = 'beginner';

  public authMode: 'signup' | 'signin' = 'signup';
  public authName = '';
  public authEmail = '';
  public authPassword = '';
  public showPassword = false;

  public motivationOptions: OnboardingOption[] = [
    { id: 'travel', icon: '✈️', title: 'Travel & Cultural Immersion', subtitle: 'Navigate airports, order regional delicacies, and converse with locals.' },
    { id: 'career', icon: '💼', title: 'Career & Professional Growth', subtitle: 'Open global remote opportunities, client meetings, and tech markets.' },
    { id: 'academic', icon: '🎓', title: 'Academic Study & Classical Literature', subtitle: 'Read native original texts, research papers, and classical prose.' },
    { id: 'family', icon: '👨‍👩‍👧', title: 'Family, Heritage & Community', subtitle: 'Connect deeply with relatives, ancestry roots, and loved ones.' },
    { id: 'brain', icon: '🧠', title: 'Mental Agility & Cognitive Workout', subtitle: 'Build neuroplasticity by structuring thoughts through new grammars.' }
  ];

  public cadenceOptions = [
    { minutes: 5, icon: '☕', title: 'Casual & Relaxed', subtitle: 'Build the initial neurological habit at a gentle pace.' },
    { minutes: 15, icon: '⚡', title: 'Consistent & Focused', subtitle: 'The ideal cadence for steady grammatical retention.', recommended: true },
    { minutes: 30, icon: '🚀', title: 'Intensive & Accelerated', subtitle: 'Fast-track spoken fluency and complete multiple modules daily.' }
  ];

  public levelOptions = [
    { id: 'beginner', icon: '🐣', title: 'Complete Beginner', subtitle: 'Start from scratch with native phonology, greetings, and basic nouns.', cefrTag: 'A1 Foundational' },
    { id: 'elementary', icon: '🌱', title: 'Some Experience', subtitle: 'Know common phrases, ready for constituent syntax and conjugation.', cefrTag: 'A2 Elementary' },
    { id: 'intermediate', icon: '🚀', title: 'Intermediate Polyglot', subtitle: 'Jump into nuanced syntactic cases, tense matrices, and AI roleplay.', cefrTag: 'B1 / B2 Conversational' }
  ];

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['lang']) {
        this.selectedLanguageId = params['lang'];
      }
      if (params['mode'] === 'signin') {
        this.authMode = 'signin';
        this.currentStep.set(5);
        this.isAuthStepOnly = true;
      }
    });
  }

  getSelectedLanguageName(): string {
    const l = this.langService.languages().find(item => item.id === this.selectedLanguageId);
    return l ? l.name : 'Spanish';
  }

  selectLanguage(id: string) {
    this.selectedLanguageId = id;
    this.langService.setLanguage(id);
    this.sfx.playWhoosh();
    this.nextStep();
  }

  selectMotivation(id: string) {
    this.selectedMotivation = id;
    this.sfx.playWhoosh();
    this.nextStep();
  }

  selectCadence(minutes: number) {
    this.selectedMinutes = minutes;
    this.sfx.playWhoosh();
    this.nextStep();
  }

  selectLevel(levelId: string) {
    this.selectedLevel = levelId;
    this.sfx.playWhoosh();
    this.nextStep();
  }

  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  getStepTitle(): string {
    switch (this.currentStep()) {
      case 1: return 'Target Language';
      case 2: return 'Your Purpose';
      case 3: return 'Daily Cadence';
      case 4: return 'Experience Level';
      case 5: return this.authMode === 'signup' ? 'Profile Setup' : 'Sign In';
      default: return '';
    }
  }

  async signInWithProvider(provider: 'google' | 'github' | 'apple') {
    await this.auth.signInWithOAuth(provider, {
      targetLanguage: this.selectedLanguageId,
      goal: this.selectedMotivation,
      dailyMinutes: this.selectedMinutes,
      startingLevel: this.selectedLevel
    });
  }

  async handleAuthSubmit(e: Event) {
    e.preventDefault();
    if (!this.authEmail.trim() || !this.authPassword.trim()) {
      this.toast.show('Please enter both email and password.', 'warning');
      return;
    }

    if (this.authMode === 'signup') {
      const ok = await this.auth.signUpWithEmail(
        this.authEmail,
        this.authPassword,
        this.authName || 'Polyglot Learner',
        this.selectedLanguageId,
        this.selectedMotivation,
        this.selectedMinutes,
        this.selectedLevel
      );
      if (ok) {
        this.completeOnboarding();
      }
    } else {
      const ok = await this.auth.signInWithEmail(this.authEmail, this.authPassword);
      if (ok) {
        this.completeOnboarding();
      }
    }
  }

  handleGuestAccess() {
    this.auth.continueAsGuest(
      this.selectedLanguageId,
      this.selectedMotivation,
      this.selectedMinutes,
      this.selectedLevel
    );
    this.completeOnboarding();
  }

  private completeOnboarding() {
    this.langService.setLanguage(this.selectedLanguageId);
    this.sfx.playFanfare();
    confetti({
      particleCount: 75,
      spread: 90,
      origin: { y: 0.6 }
    });
    this.router.navigate(['/curriculum']);
  }
}

