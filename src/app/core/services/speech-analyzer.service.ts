import { Injectable, signal } from '@angular/core';

export interface PhonemeDiff {
  expected: string;
  actual: string;
  match: boolean;
}

@Injectable({ providedIn: 'root' })
export class SpeechAnalyzerService {
  private recognition: any = null;
  public isListening = signal<boolean>(false);
  public transcript = signal<string>('');
  public accuracyScore = signal<number | null>(null);
  public isSupported = signal<boolean>(false);
  public phonemeDiffs = signal<PhonemeDiff[]>([]);
  public activeTarget = signal<string>('');
  public lastError = signal<string | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 1;
          this.isSupported.set(true);
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
          this.isSupported.set(false);
        }
      } else {
        this.isSupported.set(false);
      }
    }
  }

  startListening(localeCode: string, targetPhrase: string) {
    this.activeTarget.set(targetPhrase);
    this.lastError.set(null);
    this.transcript.set('');
    this.accuracyScore.set(null);
    this.phonemeDiffs.set([]);

    if (!this.recognition) {
      this.lastError.set('Speech recognition is not supported in this browser. You can still test pronunciation with the interactive test mode.');
      return;
    }

    try {
      this.recognition.lang = localeCode;
      this.isListening.set(true);

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let finalResult = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalResult += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const spoken = (finalResult || interim).trim();
        this.transcript.set(spoken);

        if (spoken.length > 0) {
          const score = this.calculateLevenshteinScore(targetPhrase, spoken);
          this.accuracyScore.set(score);
          this.generatePhonemeDiffs(targetPhrase, spoken);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        this.isListening.set(false);
        if (event.error !== 'no-speech') {
          this.lastError.set(`Microphone error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening.set(false);
      };

      this.recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      this.isListening.set(false);
      this.lastError.set(err?.message || 'Could not access microphone');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening()) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop on unstarted
      }
    }
    this.isListening.set(false);
  }

  /**
   * Levenshtein accuracy algorithm specified in spec
   */
  calculateLevenshteinScore(target: string, spoken: string): number {
    const s1 = target.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');
    const s2 = spoken.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '');

    if (!s1 && !s2) return 100;
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 100;

    const track = Array(s2.length + 1)
      .fill(null)
      .map(() => Array(s1.length + 1).fill(null));

    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = track[s2.length][s1.length];
    const maxLen = Math.max(s1.length, s2.length);
    const score = Math.round(((maxLen - distance) / maxLen) * 100);
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Produce word-by-word alignment for rich visual feedback
   */
  private generatePhonemeDiffs(target: string, spoken: string) {
    const targetWords = target.split(/\s+/);
    const spokenWords = spoken.split(/\s+/);
    const diffs: PhonemeDiff[] = [];

    const maxWords = Math.max(targetWords.length, spokenWords.length);
    for (let i = 0; i < maxWords; i++) {
      const exp = targetWords[i] || '';
      const act = spokenWords[i] || '';
      const cleanExp = exp.toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF\u3040-\u30FF\u4E00-\u9FAF\u0B80-\u0BFF]/g, '');
      const cleanAct = act.toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF\u3040-\u30FF\u4E00-\u9FAF\u0B80-\u0BFF]/g, '');

      diffs.push({
        expected: exp,
        actual: act,
        match: cleanExp.length > 0 && cleanAct.length > 0 && (cleanExp === cleanAct || this.calculateLevenshteinScore(cleanExp, cleanAct) > 75)
      });
    }

    this.phonemeDiffs.set(diffs);
  }

  /**
   * Fallback simulator for users without a microphone or on unsupported browsers
   */
  simulateSpeech(target: string, sampleInput?: string) {
    const input = sampleInput ?? target;
    this.transcript.set(input);
    const score = this.calculateLevenshteinScore(target, input);
    this.accuracyScore.set(score);
    this.generatePhonemeDiffs(target, input);
  }
}

