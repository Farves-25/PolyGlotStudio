import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogueMessage } from '../../../../core/models/exercise.model';
import { Language } from '../../../../core/models/language.model';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { RtlDirectionDirective } from '../../../../shared/directives/rtl-direction.directive';

@Component({
  selector: 'app-scenario-bubble',
  standalone: true,
  imports: [CommonModule, RtlDirectionDirective],
  template: `
    <div
      class="flex flex-col gap-1.5 w-full my-2 transition-all duration-300"
      [ngClass]="message.sender === 'user' ? 'items-end' : 'items-start'"
    >
      <!-- Sender & Role Meta -->
      <div class="flex items-center gap-2 px-1 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
        <span class="font-bold" [ngClass]="message.sender === 'user' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-700 dark:text-emerald-400'">
          {{ message.sender === 'user' ? 'You' : (aiRole || 'AI Native Partner') }}
        </span>
      </div>

      <!-- Dialogue Bubble -->
      <div
        class="max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm relative border"
        [ngClass]="message.sender === 'user'
          ? 'bg-indigo-600 text-white rounded-br-sm border-indigo-500'
          : 'bg-white dark:bg-zinc-800/90 text-slate-900 dark:text-zinc-100 rounded-bl-sm border-slate-200 dark:border-zinc-700'"
      >
        <div class="flex items-start justify-between gap-3">
          <!-- Text in Native script with RTL support -->
          <div
            [appRtlDirection]="language?.script_direction || 'ltr'"
            class="text-sm md:text-base font-medium leading-relaxed"
            [ngClass]="getLanguageFontClass()"
          >
            {{ message.text }}
          </div>

          <!-- Speak Button -->
          <button
            (click)="speak()"
            class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            [ngClass]="message.sender === 'user' ? 'bg-indigo-500/50 hover:bg-indigo-400 text-white' : 'bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 text-slate-600 dark:text-zinc-300'"
            title="Listen to pronunciation"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>

        <!-- Translation Hint -->
        <div
          *ngIf="showTranslation"
          class="mt-2 pt-2 border-t text-xs font-normal transition-opacity"
          [ngClass]="message.sender === 'user' ? 'border-indigo-400/40 text-indigo-100' : 'border-slate-100 dark:border-zinc-700 text-slate-500 dark:text-zinc-400'"
        >
          {{ message.translation }}
        </div>

        <!-- Cultural Tip / Etiquette Note -->
        <div
          *ngIf="message.cultural_tip"
          class="mt-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5"
        >
          <span class="font-bold">Tip:</span>
          <span>{{ message.cultural_tip }}</span>
        </div>
      </div>

      <!-- Action Footer: Translation Toggle -->
      <div class="px-1">
        <button
          (click)="showTranslation = !showTranslation"
          class="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors underline"
        >
          {{ showTranslation ? 'Hide English translation' : 'Translate to English' }}
        </button>
      </div>
    </div>
  `
})
export class ScenarioBubbleComponent {
  @Input({ required: true }) message!: DialogueMessage;
  @Input() language?: Language;
  @Input() aiRole?: string;

  public showTranslation = true;
  private ttsService = inject(TextToSpeechService);

  speak() {
    if (this.language) {
      this.ttsService.speak(this.message.text, this.language.locale_code);
    }
  }

  getLanguageFontClass(): string {
    if (!this.language) return '';
    if (this.language.id === 'ar') return 'font-arabic text-xl';
    if (this.language.id === 'ta') return 'font-tamil text-lg';
    if (this.language.id === 'ja') return 'font-japanese';
    return '';
  }
}

