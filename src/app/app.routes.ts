import { Routes, Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { WelcomeComponent } from './features/welcome/welcome.component';
import { OnboardingWizardComponent } from './features/onboarding/onboarding-wizard.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CurriculumComponent } from './features/curriculum/curriculum.component';
import { LessonRunnerComponent } from './features/lesson-studio/lesson-runner.component';
import { VocabularyVaultComponent } from './features/vocabulary/vocabulary-vault.component';
import { PhoneticsLabComponent } from './features/phonetics/phonetics-lab.component';
import { GrammarSandboxComponent } from './features/grammar/grammar-sandbox.component';
import { RoleplayHubComponent } from './features/roleplay/roleplay-hub.component';
import { LeaderboardComponent } from './features/leaderboard/leaderboard.component';
import { SettingsComponent } from './features/settings/settings.component';
import { PhrasebookComponent } from './features/phrasebook/phrasebook.component';
import { PhraseListComponent } from './features/phrasebook/phrase-list.component';
import { PhraseQuizComponent } from './features/phrasebook/phrase-quiz.component';

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
  { path: 'welcome',    component: WelcomeComponent },
  { path: 'onboarding', component: OnboardingWizardComponent, canActivate: [guestGuard] },

  // Phrasebook routes (Loecsen-style)
  { path: 'learn',                             redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'learn/:langId',                     component: PhrasebookComponent },
  { path: 'learn/:langId/:categoryId',         component: PhraseListComponent },
  { path: 'quiz/:langId/:categoryId',          component: PhraseQuizComponent },

  // Studio routes
  { path: 'dashboard',  component: DashboardComponent },
  { path: 'curriculum', component: CurriculumComponent },
  { path: 'studio',     component: LessonRunnerComponent },
  { path: 'vocabulary', component: VocabularyVaultComponent },
  { path: 'phonetics',  component: PhoneticsLabComponent },
  { path: 'grammar',    component: GrammarSandboxComponent },
  { path: 'roleplay',   component: RoleplayHubComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'settings',   component: SettingsComponent },

  { path: '**',         redirectTo: 'welcome' }
];
