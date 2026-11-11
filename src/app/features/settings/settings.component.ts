import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextToSpeechService } from '../../core/services/text-to-speech.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Studio Preferences
        </h2>
        <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Customize audio pronunciation velocity, sound effects, and manage your account.
        </p>
      </div>

      <!-- SECTION 1: AUDIO SYNTHESIS & SFX -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-200/80 dark:border-zinc-800/80">
          <span class="text-2xl">🎙️</span>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Audio & Speech Synthesis Engine</h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400">Web Speech API rate controls and procedural UI sound effects</p>
          </div>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <div class="flex justify-between mb-1.5 font-mono">
              <span class="text-slate-700 dark:text-zinc-300 font-semibold">Native Speech Velocity</span>
              <span class="text-indigo-600 dark:text-indigo-400 font-bold">{{ tts.playbackRate() }}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              [ngModel]="tts.playbackRate()"
              (ngModelChange)="tts.setRate($event)"
              class="w-full accent-indigo-600"
            />
            <div class="flex justify-between text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
              <span>0.5x Slow</span>
              <span>1.0x Normal</span>
              <span>1.5x Rapid</span>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
            <div>
              <strong class="text-slate-900 dark:text-white block font-semibold">Web Audio UI Sound Effects</strong>
              <span class="text-[11px] text-slate-500 dark:text-zinc-400">Auditory chimes on successful phoneme matches and flips</span>
            </div>
            <button
              (click)="sfx.toggleSound()"
              class="px-3.5 py-1.5 rounded-xl border font-mono font-semibold text-xs transition-colors"
              [ngClass]="sfx.soundEnabled()
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700'"
            >
              {{ sfx.soundEnabled() ? 'Enabled' : 'Disabled' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Account & Data Management (Danger Zone) -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-5">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>👤</span> Account & Privacy
          </h3>
          <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage your account credentials, active session, and cloud storage data.
          </p>
        </div>

        <!-- Account Profile Details -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-sun-200 dark:bg-sun-400/20 text-lg overflow-hidden shrink-0">
              <img *ngIf="isAvatarUrl(auth.currentUser()?.avatar); else emojiAv"
                   [src]="auth.currentUser()?.avatar"
                   alt="Avatar"
                   class="h-full w-full object-cover rounded-xl" />
              <ng-template #emojiAv>
                <span>{{ auth.currentUser()?.avatar || '🧑‍🚀' }}</span>
              </ng-template>
            </span>
            <div>
              <div class="font-bold text-slate-900 dark:text-white text-sm">
                {{ auth.currentUser()?.name || 'Polyglot Explorer' }}
              </div>
              <div class="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                {{ auth.currentUser()?.email || 'learner@polyglotstudio.local' }}
                <span class="capitalize ml-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-zinc-800">
                  {{ auth.currentUser()?.provider || 'demo' }}
                </span>
              </div>
            </div>
          </div>

          <button
            (click)="auth.signOut()"
            class="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 font-semibold text-xs text-slate-700 dark:text-zinc-300 transition-colors shrink-0"
          >
            Sign Out
          </button>
        </div>

        <!-- Danger Zone: Delete Account -->
        <div class="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <span>⚠️</span> Danger Zone — Delete Account
              </div>
              <p class="text-xs text-rose-600/90 dark:text-rose-300/80 mt-1 max-w-xl">
                Permanently delete your account, vocabulary flashcards, study streak, and XP. This action is irreversible.
              </p>
            </div>

            <button
              *ngIf="!confirmingDelete"
              (click)="confirmingDelete = true"
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all transform active:scale-95 shrink-0"
            >
              Delete Account
            </button>
          </div>

          <!-- Confirmation prompt -->
          <div *ngIf="confirmingDelete" class="pt-3 border-t border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <span class="text-xs font-semibold text-rose-800 dark:text-rose-200">
              Are you completely sure? All your study progress will be erased immediately.
            </span>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button
                (click)="confirmingDelete = false"
                class="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="deleteAccount()"
                class="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  public tts = inject(TextToSpeechService);
  public sfx = inject(AudioSfxService);
  public auth = inject(AuthService);
  private toast = inject(ToastService);

  public confirmingDelete = false;

  async deleteAccount() {
    await this.auth.deleteAccount();
  }

  isAvatarUrl(avatar?: string | null): boolean {
    return !!avatar && (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:'));
  }
}

