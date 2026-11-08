import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Exercise, DialogueScenario } from '../../../../core/models/exercise.model';
import { Language } from '../../../../core/models/language.model';
import { AiDialogueService } from '../../../../core/services/ai-dialogue.service';
import { SpeechAnalyzerService } from '../../../../core/services/speech-analyzer.service';
import { ScenarioBubbleComponent } from './scenario-bubble.component';
import { RtlDirectionDirective } from '../../../../shared/directives/rtl-direction.directive';

@Component({
  selector: 'app-ai-roleplay',
  standalone: true,
  imports: [CommonModule, FormsModule, ScenarioBubbleComponent, RtlDirectionDirective],
  template: `
    <div class="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <!-- Scenario Context Header -->
      <div class="surface-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base shadow-sm">
            💬
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              {{ scenario?.title || exercise.prompt }}
            </h4>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              Setting: {{ scenario?.setting }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono">
          <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
            Role: <strong class="text-indigo-600 dark:text-indigo-400">{{ scenario?.role }}</strong>
          </span>
          <button
            (click)="restartScenario()"
            class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Restart conversation"
          >
            ↺ Restart
          </button>
        </div>
      </div>

      <!-- Dialogue History Stream -->
      <div class="surface-panel p-4 md:p-6 rounded-2xl min-h-[320px] max-h-[500px] overflow-y-auto flex flex-col transition-colors">
        <app-scenario-bubble
          *ngFor="let msg of dialogueService.messages()"
          [message]="msg"
          [language]="language"
          [aiRole]="scenario?.ai_role"
        ></app-scenario-bubble>

        <!-- AI Typing Indicator -->
        <div *ngIf="dialogueService.isThinking()" class="flex items-center gap-2 p-3 my-2 text-xs text-slate-500 dark:text-zinc-400 font-mono animate-pulse">
          <span class="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping"></span>
          <span>{{ scenario?.ai_role || 'AI Partner' }} is composing response...</span>
        </div>
      </div>

      <!-- Quick Suggested Response Chips -->
      <div *ngIf="scenario?.suggested_responses?.length" class="flex flex-col gap-1.5">
        <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1 font-semibold">
          Suggested Phrases (Click to Send):
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            *ngFor="let suggestion of scenario?.suggested_responses"
            (click)="sendSuggested(suggestion.text)"
            class="text-left px-3.5 py-2 rounded-xl bg-white hover:bg-indigo-50/60 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 transition-all transform active:scale-95 group shadow-sm"
          >
            <div class="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{{ suggestion.text }}</div>
            <div class="text-[10px] text-slate-500 dark:text-zinc-400">{{ suggestion.translation }}</div>
          </button>
        </div>
      </div>

      <!-- User Reply Input Box with Speech Recognition Input -->
      <div class="surface-card p-2.5 rounded-2xl flex items-center gap-3 transition-colors">
        <!-- Mic Input for Spoken Dialogue -->
        <button
          (click)="toggleMicInput()"
          class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          [ngClass]="analyzer.isListening() ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'"
          title="Speak your reply"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <!-- Text Input with native script typography -->
        <input
          type="text"
          [(ngModel)]="inputText"
          (keydown.enter)="sendMessage()"
          [placeholder]="analyzer.isListening() ? 'Listening to speech...' : 'Type response in ' + (language?.name || 'target language') + '...'"
          class="flex-1 bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none text-xs md:text-sm"
          [appRtlDirection]="language?.script_direction || 'ltr'"
          [ngClass]="getLanguageFontClass()"
        />

        <!-- Send Button -->
        <button
          (click)="sendMessage()"
          [disabled]="!inputText.trim() || dialogueService.isThinking()"
          class="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-sm"
        >
          Send
        </button>
      </div>
    </div>
  `
})
export class AiRoleplayComponent implements OnChanges {
  @Input({ required: true }) exercise!: Exercise;
  @Input() language?: Language;

  public dialogueService = inject(AiDialogueService);
  public analyzer = inject(SpeechAnalyzerService);

  public inputText = '';
  public scenario: DialogueScenario | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exercise'] && this.exercise.dialogue_scenario) {
      this.scenario = this.exercise.dialogue_scenario;
      this.dialogueService.initScenario(this.scenario);
      this.inputText = '';
    }
  }

  restartScenario() {
    if (this.scenario) {
      this.dialogueService.initScenario(this.scenario);
      this.inputText = '';
    }
  }

  sendSuggested(text: string) {
    this.inputText = text;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.inputText.trim() || this.dialogueService.isThinking()) return;
    const text = this.inputText.trim();
    this.inputText = '';
    const langId = this.language?.id || 'es';
    this.dialogueService.sendUserMessage(text, langId, this.scenario || undefined);
  }

  toggleMicInput() {
    if (this.analyzer.isListening()) {
      this.analyzer.stopListening();
      if (this.analyzer.transcript()) {
        this.inputText = this.analyzer.transcript();
      }
    } else {
      const locale = this.language?.locale_code || 'en-US';
      this.analyzer.startListening(locale, this.exercise.target_text);
      // When speech is recognized, set to input text
      const interval = setInterval(() => {
        if (!this.analyzer.isListening()) {
          clearInterval(interval);
          if (this.analyzer.transcript()) {
            this.inputText = this.analyzer.transcript();
          }
        }
      }, 300);
    }
  }

  getLanguageFontClass(): string {
    if (!this.language) return '';
    if (this.language.id === 'ar') return 'font-arabic';
    if (this.language.id === 'ta') return 'font-tamil';
    if (this.language.id === 'ja') return 'font-japanese';
    return '';
  }
}

