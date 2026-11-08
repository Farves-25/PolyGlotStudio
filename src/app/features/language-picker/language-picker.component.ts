import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { Language } from '../../core/models/language.model';

@Component({
  selector: 'app-language-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Target Language Acquisition Deck
          </h3>
          <p class="text-xs text-slate-500 dark:text-zinc-400">
            Select a target tongue to load phonology, syntax dissectors, and contextual AI dialogues.
          </p>
        </div>
      </div>

      <!-- Language Cards Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          *ngFor="let lang of languageService.languages()"
          (click)="select(lang.id)"
          class="relative text-left p-3.5 md:p-4 rounded-2xl border transition-all duration-300 transform active:scale-95 group flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-sm"
          [ngClass]="languageService.selectedLanguage().id === lang.id
            ? 'surface-card border-indigo-500 ring-2 ring-indigo-500/20'
            : 'surface-card hover:bg-slate-50 dark:hover:bg-zinc-800/60 border-slate-200/80 dark:border-zinc-800'"
        >
          <!-- Active Indicator Light -->
          <div
            *ngIf="languageService.selectedLanguage().id === lang.id"
            class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping"
          ></div>

          <div>
            <!-- Flag and Script Direction -->
            <div class="flex items-center justify-between mb-2">
              <span class="text-2xl md:text-3xl select-none">{{ lang.flag_emoji }}</span>
              <span
                class="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold"
                [ngClass]="lang.script_direction === 'rtl' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'"
              >
                {{ lang.script_direction.toUpperCase() }}
              </span>
            </div>

            <!-- Native & English Names -->
            <div
              class="text-base md:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors"
              [ngClass]="getLanguageFont(lang.id)"
            >
              {{ lang.native_name }}
            </div>
            <div class="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {{ lang.name }}
            </div>
          </div>

          <!-- Difficulty / Dialect Tag -->
          <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>{{ lang.difficulty || 'A1-C1' }}</span>
            <span class="text-indigo-400 group-hover:text-indigo-300">Select →</span>
          </div>
        </button>
      </div>
    </div>
  `
})
export class LanguagePickerComponent {
  public languageService = inject(LanguageService);
  @Output() onLanguageChanged = new EventEmitter<string>();

  select(langId: string) {
    this.languageService.selectLanguage(langId);
    this.onLanguageChanged.emit(langId);
  }

  getLanguageFont(langId: string): string {
    if (langId === 'ar') return 'font-arabic text-lg';
    if (langId === 'ta') return 'font-tamil text-base';
    if (langId === 'ja') return 'font-japanese';
    return '';
  }
}

