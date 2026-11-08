import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TextToSpeechService {
  public isPlaying = signal<boolean>(false);
  public currentSpeakingText = signal<string | null>(null);
  public playbackRate = signal<number>(0.9); // default slightly measured for foreign learners
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public setRate(rate: number) {
    this.playbackRate.set(rate);
  }

  public speak(text: string, localeCode: string, customRate?: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('SpeechSynthesis is not supported in this environment');
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending utterance

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = localeCode;
      utterance.rate = customRate ?? this.playbackRate();
      utterance.pitch = 1.0;

      // Locate best matching native voice
      if (this.voices.length === 0) {
        this.loadVoices();
      }

      const exactVoice = this.voices.find(v => v.lang === localeCode);
      const prefixVoice = this.voices.find(v => v.lang.startsWith(localeCode.split('-')[0]));
      if (exactVoice) {
        utterance.voice = exactVoice;
      } else if (prefixVoice) {
        utterance.voice = prefixVoice;
      }

      this.isPlaying.set(true);
      this.currentSpeakingText.set(text);

      utterance.onend = () => {
        this.isPlaying.set(false);
        this.currentSpeakingText.set(null);
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        this.isPlaying.set(false);
        this.currentSpeakingText.set(null);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isPlaying.set(false);
      this.currentSpeakingText.set(null);
    }
  }
}

