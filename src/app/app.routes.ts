import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CurriculumComponent } from './features/curriculum/curriculum.component';
import { LessonRunnerComponent } from './features/lesson-studio/lesson-runner.component';
import { VocabularyVaultComponent } from './features/vocabulary/vocabulary-vault.component';
import { PhoneticsLabComponent } from './features/phonetics/phonetics-lab.component';
import { GrammarSandboxComponent } from './features/grammar/grammar-sandbox.component';
import { RoleplayHubComponent } from './features/roleplay/roleplay-hub.component';
import { LeaderboardComponent } from './features/leaderboard/leaderboard.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'curriculum', component: CurriculumComponent },
  { path: 'studio', component: LessonRunnerComponent },
  { path: 'vocabulary', component: VocabularyVaultComponent },
  { path: 'phonetics', component: PhoneticsLabComponent },
  { path: 'grammar', component: GrammarSandboxComponent },
  { path: 'roleplay', component: RoleplayHubComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'dashboard' }
];
