import { Routes, Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};

export const routes: Routes = [
  // Public landing & onboarding
  { path: '',           redirectTo: 'welcome',   pathMatch: 'full' },
  {
    path: 'welcome',
    loadComponent: () => import('./features/welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding-wizard.component').then(m => m.OnboardingWizardComponent),
    canActivate: [guestGuard]
  },

  // Phrasebook routes (Loecsen-style)
  { path: 'learn',                             redirectTo: 'welcome', pathMatch: 'full' },
  {
    path: 'learn/:langId',
    loadComponent: () => import('./features/phrasebook/phrasebook.component').then(m => m.PhrasebookComponent)
  },
  {
    path: 'learn/:langId/:categoryId',
    loadComponent: () => import('./features/phrasebook/phrase-list.component').then(m => m.PhraseListComponent)
  },
  {
    path: 'quiz/:langId/:categoryId',
    loadComponent: () => import('./features/phrasebook/phrase-quiz.component').then(m => m.PhraseQuizComponent)
  },

  // Studio routes
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'curriculum',
    loadComponent: () => import('./features/curriculum/curriculum.component').then(m => m.CurriculumComponent)
  },
  {
    path: 'alphabet',
    loadComponent: () => import('./features/alphabet/alphabet-studio.component').then(m => m.AlphabetStudioComponent)
  },
  {
    path: 'studio',
    loadComponent: () => import('./features/lesson-studio/lesson-runner.component').then(m => m.LessonRunnerComponent)
  },
  {
    path: 'vocabulary',
    loadComponent: () => import('./features/vocabulary/vocabulary-vault.component').then(m => m.VocabularyVaultComponent)
  },
  {
    path: 'phonetics',
    loadComponent: () => import('./features/phonetics/phonetics-lab.component').then(m => m.PhoneticsLabComponent)
  },
  {
    path: 'grammar',
    loadComponent: () => import('./features/grammar/grammar-sandbox.component').then(m => m.GrammarSandboxComponent)
  },
  {
    path: 'roleplay',
    loadComponent: () => import('./features/roleplay/roleplay-hub.component').then(m => m.RoleplayHubComponent)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },

  { path: '**',         redirectTo: 'welcome' }
];
