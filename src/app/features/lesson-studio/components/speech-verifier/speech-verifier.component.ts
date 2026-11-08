import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise } from '../../../../core/models/exercise.model';
import { Language } from '../../../../core/models/language.model';
import { SpeechAnalyzerService } from '../../../../core/services/speech-analyzer.service';
import { TextToSpeechService } from '../../../../core/services/text-to-speech.service';
import { AudioVisualizerComponent } from './audio-visualizer.component';
import { AccuracyBadgeComponent } from './accuracy-badge.component';
import { RtlDirectionDirective } from '../../../../shared/directives/rtl-direction.directive';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-speech-verifier',
  standalone: true,
  imports: [
    CommonModule,
    AudioVisualizerComponent,
    AccuracyBadgeComponent,
    RtlDirectionDirective,
    LucideAngularModule
  ],
  template: `
    <div class="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <!-- Target Phrase Card -->
      <div class="surface-card p-6 md:p-8 rounded-2xl relative overflow-hidden transition-colors">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs uppercase font-mono tracking-wider text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Acoustic Verification Studio
          </span>

          <!-- Listen Native Audio Button -->
          <div class="flex items-center gap-2">
            <button
              (click)="toggleSlowAudio()"
              class="px-2.5 py-1 text-xs font-mono rounded-lg transition-colors border"
              [ngClass]="ttsService.playbackRate() < 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/40' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'"
              title="Toggle slow playback for phonetic clarity"
            >
              {{ ttsService.playbackRate() < 1 ? '0.75x Slow' : '1.0x Normal' }}
            </button>

            <button
              (click)="playNativeAudio()"
              [disabled]="ttsService.isPlaying()"
              class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all transform active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span>{{ ttsService.isPlaying() ? 'Playing Native...' : 'Listen Native' }}</span>
            </button>

            <!-- Play User Recorded Audio (if recorded) -->
            <button
              *ngIf="recordedAudioUrl"
              (click)="playUserRecording()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-sm transition-all"
              title="Listen back to your microphone recording"
            >
              <span>▶</span>
              <span>Play My Voice</span>
            </button>
          </div>
        </div>

        <!-- Target Phrase with Native RTL / Script styling -->
        <div
          [appRtlDirection]="language?.script_direction || 'ltr'"
          class="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3"
          [ngClass]="getLanguageFontClass()"
        >
          {{ exercise.target_text }}
        </div>

        <!-- Phonetic IPA / Transliteration Guide -->
        <div *ngIf="exercise.phonetic_guide" class="text-sm font-phonetic text-indigo-600 dark:text-indigo-400 font-medium tracking-wide mb-2">
          {{ exercise.phonetic_guide }}
        </div>

        <!-- Meaning / Cultural Context -->
        <div class="text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-200 dark:border-zinc-800 pt-3 mt-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div><span class="text-slate-400 dark:text-zinc-500 font-medium">Meaning:</span> {{ exercise.translation }}</div>
          <div *ngIf="exercise.cultural_context" class="italic text-slate-500">
            {{ exercise.cultural_context }}
          </div>
        </div>
      </div>

      <!-- Real-time Canvas Waveform Visualizer -->
      <app-audio-visualizer
        [isActive]="analyzer.isListening()"
        [accentColor]="language?.accent_color || '#6366f1'"
      ></app-audio-visualizer>

      <!-- Recording Microphone Action Area -->
      <div class="flex flex-col items-center justify-center gap-4 py-2">
        <div class="relative">
          <!-- Animated pulse rings when listening -->
          <div
            *ngIf="analyzer.isListening()"
            class="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping pointer-events-none"
          ></div>
          <div
            *ngIf="analyzer.isListening()"
            class="absolute -inset-2 rounded-full bg-rose-500/30 animate-pulse pointer-events-none"
          ></div>

          <button
            (click)="toggleListening()"
            class="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-md focus:outline-none"
            [ngClass]="analyzer.isListening() ? 'bg-rose-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'"
            title="Click to Record Pronunciation"
          >
            <svg *ngIf="!analyzer.isListening()" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <svg *ngIf="analyzer.isListening()" class="w-7 h-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>

        <div class="text-center">
          <p class="text-xs font-semibold" [ngClass]="analyzer.isListening() ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-slate-700 dark:text-zinc-300'">
            {{ analyzer.isListening() ? 'Listening... Speak target phrase into microphone' : 'Tap microphone and read phrase aloud' }}
          </p>
          <p class="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">
            Speech Recognition: {{ language?.locale_code }}
          </p>
        </div>

        <!-- Simulation quick actions for immediate offline testing -->
        <div class="flex items-center gap-2 pt-1">
          <button
            (click)="testSimulated(100)"
            class="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-zinc-800"
            title="Instant exact match test"
          >
            Simulate 100%
          </button>
          <button
            (click)="testSimulated(80)"
            class="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors border border-slate-200 dark:border-zinc-800"
            title="Instant conversational match test"
          >
            Simulate 80%
          </button>
        </div>
      </div>

      <!-- Spoken Transcript & Phoneme Diff Feedback -->
      <div *ngIf="analyzer.transcript()" class="surface-card p-5 rounded-2xl flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono uppercase text-slate-500 dark:text-zinc-400">Captured Phonetic Transcription</span>
          <app-accuracy-badge [score]="analyzer.accuracyScore()"></app-accuracy-badge>
        </div>

        <!-- Word alignment tokens -->
        <div class="flex flex-wrap gap-2 items-center">
          <span
            *ngFor="let diff of analyzer.phonemeDiffs()"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold border flex flex-col items-center transition-all"
            [ngClass]="diff.match ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'"
          >
            <span>{{ diff.actual || diff.expected }}</span>
            <span class="text-[9px] font-mono opacity-70 uppercase">{{ diff.match ? 'Match' : 'Mismatch' }}</span>
          </span>
        </div>

        <div class="text-xs text-slate-500 dark:text-zinc-400">
          Raw Transcript: <span class="text-slate-900 dark:text-zinc-200 font-mono italic">"{{ analyzer.transcript() }}"</span>
        </div>
      </div>
    </div>
  `
})
export class SpeechVerifierComponent {
  @Input({ required: true }) exercise!: Exercise;
  @Input() language?: Language;

  public analyzer = inject(SpeechAnalyzerService);
  public ttsService = inject(TextToSpeechService);
  public recordedAudioUrl: string | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  toggleListening() {
    if (this.analyzer.isListening()) {
      this.analyzer.stopListening();
      this.stopMediaRecording();
    } else {
      const locale = this.language?.locale_code || 'en-US';
      this.analyzer.startListening(locale, this.exercise.target_text);
      this.startMediaRecording();
    }
  }

  private async startMediaRecording() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.audioChunks.push(e.data);
        };
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          if (this.recordedAudioUrl) URL.revokeObjectURL(this.recordedAudioUrl);
          this.recordedAudioUrl = URL.createObjectURL(blob);
        };
        this.mediaRecorder.start();
      }
    } catch {
      // Audio record fallback
    }
  }

  private stopMediaRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
  }

  playUserRecording() {
    if (this.recordedAudioUrl) {
      const audio = new Audio(this.recordedAudioUrl);
      audio.play();
    }
  }

  playNativeAudio() {
    const locale = this.language?.locale_code || 'en-US';
    this.ttsService.speak(this.exercise.target_text, locale);
  }

  toggleSlowAudio() {
    if (this.ttsService.playbackRate() < 1) {
      this.ttsService.setRate(1.0);
    } else {
      this.ttsService.setRate(0.75);
    }
  }

  testSimulated(scoreTier: number) {
    if (scoreTier === 100) {
      this.analyzer.simulateSpeech(this.exercise.target_text);
    } else {
      const words = this.exercise.target_text.split(' ');
      if (words.length > 2) {
        // Alter one word to simulate variance
        const varied = [...words];
        varied[varied.length - 1] = varied[varied.length - 1] + 's';
        this.analyzer.simulateSpeech(this.exercise.target_text, varied.join(' '));
      } else {
        this.analyzer.simulateSpeech(this.exercise.target_text);
      }
    }
  }

  getLanguageFontClass(): string {
    if (!this.language) return '';
    if (this.language.id === 'ar') return 'font-arabic text-3xl md:text-4xl leading-relaxed';
    if (this.language.id === 'ta') return 'font-tamil text-2xl md:text-3xl leading-relaxed';
    if (this.language.id === 'ja') return 'font-japanese text-2xl md:text-3xl';
    return '';
  }
}

