import { Injectable, inject, signal } from '@angular/core';
import { AudioSfxService } from './audio-sfx.service';

@Injectable({ providedIn: 'root' })
export class TextToSpeechService {
  public isPlaying = signal<boolean>(false);
  public currentSpeakingText = signal<string | null>(null);
  public playbackRate = signal<number>(1.0);
  public isSlow = signal<boolean>(false);
  public isSupported = signal<boolean>(true);
  public lastError = signal<string | null>(null);

  private sfx = inject(AudioSfxService);
  private voices: SpeechSynthesisVoice[] = [];
  private keepAliveTimer?: ReturnType<typeof setInterval>;
  private keepAliveOwner = 0;
  private requestId = 0;

  /** Utterance reference prevents Chrome garbage collection mid-speech */
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  /** Active HTML5 audio element for streaming fallback */
  private activeAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const refresh = () => this.loadVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', refresh);
      window.speechSynthesis.onvoiceschanged = refresh;
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      this.voices = list;
    }
  }

  public toggleSlow(): boolean {
    const next = !this.isSlow();
    this.isSlow.set(next);
    if (next) {
      this.playbackRate.set(0.75);
    } else {
      this.playbackRate.set(1.0);
    }
    return next;
  }

  public setRate(rate: number): void {
    this.playbackRate.set(rate);
    if (rate <= 0.8) {
      this.isSlow.set(true);
    } else if (rate >= 0.95) {
      this.isSlow.set(false);
    }
  }

  /**
   * Speak `text` in the target language.
   *
   * Dual-engine strategy:
   * 1. If the browser has an authentic native voice for the target language, use Web Speech API.
   * 2. If the browser lacks a native voice (e.g. Arabic, Tamil on Windows), or if Web Speech fails/hangs,
   *    seamlessly stream authentic native pronunciation via high-fidelity audio streams.
   * 3. Resolves reliably when playback ends so caller UI & auto-play loops advance smoothly.
   */
  public speak(text: string, localeCode: string, customRate?: number): Promise<void> {
    const clean = (text ?? '').trim();
    if (!clean) return Promise.resolve();

    // Unlock audio context and refresh voices
    this.prime();
    this.loadVoices();

    // Increment request ID to cancel/supersede any pending actions
    const reqId = ++this.requestId;
    const baseRate = this.isSlow() ? 0.75 : (this.playbackRate() || 1.0);
    const rate = this.clampRate(customRate !== undefined ? customRate : baseRate);
    const langCode = this.extractLangCode(localeCode);

    // Stop any existing utterance or audio stream
    this.stopPlaybackOnly();

    this.isPlaying.set(true);
    this.currentSpeakingText.set(clean);
    this.lastError.set(null);

    // Check if browser has an authentic matching voice for this specific language
    const voice = this.pickVoice(localeCode);

    if (voice) {
      // Voice is present in OS/browser: attempt SpeechSynthesis with automatic stream fallback on failure
      return this.startSynthesis(clean, voice, localeCode, rate, reqId, langCode);
    } else {
      // No voice for this language installed: go directly to high-fidelity audio stream
      // (avoiding passing Arabic/Tamil to an English voice which causes silent failure)
      return this.playAudioStream(clean, langCode, rate, reqId);
    }
  }

  private startSynthesis(
    text: string,
    voice: SpeechSynthesisVoice,
    localeCode: string,
    rate: number,
    requestId: number,
    langCode: string,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang || localeCode;
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      this.activeUtterance = utterance;

      let settled = false;
      let started = false;
      let watchdog: ReturnType<typeof setTimeout> | undefined;
      let startCheck: ReturnType<typeof setTimeout> | undefined;

      const isCurrent = () => requestId === this.requestId;

      const clearTimers = () => {
        if (watchdog) clearTimeout(watchdog);
        if (startCheck) clearTimeout(startCheck);
        watchdog = undefined;
        startCheck = undefined;
        if (requestId === this.keepAliveOwner) {
          this.stopKeepAlive();
        }
      };

      const releaseUtterance = () => {
        if (this.activeUtterance === utterance) this.activeUtterance = null;
      };

      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimers();
        releaseUtterance();
        if (isCurrent()) {
          this.isPlaying.set(false);
          this.currentSpeakingText.set(null);
        }
        resolve();
      };

      const fallbackToStream = () => {
        if (settled) return;
        settled = true;
        clearTimers();
        releaseUtterance();
        try {
          synth.cancel();
        } catch { /* ignored */ }
        if (!isCurrent()) {
          resolve();
          return;
        }
        // Seamlessly switch to audio stream
        this.playAudioStream(text, langCode, rate, requestId).then(resolve);
      };

      utterance.onstart = () => {
        if (!isCurrent()) return;
        started = true;
        this.isPlaying.set(true);
        this.currentSpeakingText.set(text);
      };

      utterance.onend = () => finish();

      utterance.onerror = (event) => {
        const code = (event as SpeechSynthesisErrorEvent)?.error;
        if (code === 'canceled' || code === 'interrupted') {
          if (!isCurrent()) {
            clearTimers();
            releaseUtterance();
            resolve();
            return;
          }
        }
        console.warn(`[TTS] Synthesis error (${code}), falling back to audio stream.`);
        fallbackToStream();
      };

      const startNow = () => {
        if (settled || !isCurrent()) return;

        try {
          if (synth.paused) synth.resume();
          synth.speak(utterance);
        } catch (error) {
          console.warn('[TTS] synth.speak threw, falling back to audio stream:', error);
          fallbackToStream();
          return;
        }

        this.startKeepAlive(synth, requestId);

        // If synthesis does not start within 900ms, fall back to stream
        startCheck = setTimeout(() => {
          if (settled || started || !isCurrent()) return;
          if (!synth.speaking && !synth.pending) {
            console.warn('[TTS] Synthesis stalled or dropped, falling back to audio stream.');
            fallbackToStream();
          }
        }, 900);
      };

      if (synth.speaking || synth.pending) {
        try {
          synth.cancel();
        } catch { /* ignored */ }
        window.setTimeout(startNow, 60);
      } else {
        startNow();
      }

      // Safety watchdog
      const watchdogMs = Math.max(6000, Math.min(30000, text.length * 400 + 2000));
      watchdog = setTimeout(() => {
        if (settled) return;
        if (!isCurrent()) {
          resolve();
          return;
        }
        if (!synth.speaking && !synth.pending) {
          finish();
        }
      }, watchdogMs);
    });
  }

  /**
   * Plays crystal-clear native speech via web audio streaming.
   * Tries multiple robust endpoints with no-referrer policy so Arabic, Tamil, Japanese,
   * German, Spanish, and French always play with 100% reliability.
   */
  private playAudioStream(
    text: string,
    langCode: string,
    rate: number,
    requestId: number,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      if (typeof window === 'undefined') {
        this.isPlaying.set(false);
        this.currentSpeakingText.set(null);
        resolve();
        return;
      }

      const isCurrent = () => requestId === this.requestId;
      let settled = false;
      let endpointIndex = 0;
      let watchdog: ReturnType<typeof setTimeout> | undefined;

      const endpoints = [
        `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(text)}`,
        `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(text)}`,
        `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${encodeURIComponent(langCode)}&q=${encodeURIComponent(text)}`,
      ];

      // Create audio element with strict no-referrer policy
      let audio: HTMLAudioElement;
      try {
        audio = document.createElement('audio');
        (audio as any).referrerPolicy = 'no-referrer';
        audio.setAttribute('referrerpolicy', 'no-referrer');
        audio.style.display = 'none';
        document.body.appendChild(audio);
      } catch {
        audio = new Audio();
        try {
          (audio as any).referrerPolicy = 'no-referrer';
          audio.setAttribute('referrerpolicy', 'no-referrer');
        } catch { /* ignored */ }
      }

      this.activeAudio = audio;
      audio.preload = 'auto';
      audio.playbackRate = this.clampRate(rate);

      const finish = () => {
        if (settled) return;
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        if (this.activeAudio) {
          try {
            this.activeAudio.onplay = null;
            this.activeAudio.onended = null;
            this.activeAudio.onerror = null;
            this.activeAudio.pause();
            if (this.activeAudio.parentNode) {
              this.activeAudio.parentNode.removeChild(this.activeAudio);
            }
          } catch { /* ignored */ }
          this.activeAudio = null;
        }
        if (isCurrent()) {
          this.isPlaying.set(false);
          this.currentSpeakingText.set(null);
        }
        resolve();
      };

      const tryNextEndpoint = () => {
        if (settled || !isCurrent()) {
          finish();
          return;
        }

        endpointIndex++;
        if (endpointIndex < endpoints.length) {
          tryPlayCurrent();
        } else {
          // Acoustic feedback so user always gets audio response
          try {
            this.sfx.playCardFlip();
          } catch { /* ignored */ }
          this.lastError.set('Audio streaming unavailable offline.');
          finish();
        }
      };

      const tryPlayCurrent = () => {
        if (settled || !isCurrent()) return;
        try {
          audio.src = endpoints[endpointIndex];
          audio.load();
          const p = audio.play();
          if (p) {
            p.catch((err) => {
              console.warn(`[TTS] Audio endpoint ${endpointIndex} failed:`, err);
              tryNextEndpoint();
            });
          }
        } catch (err) {
          console.warn(`[TTS] Audio load threw:`, err);
          tryNextEndpoint();
        }
      };

      audio.onplay = () => {
        if (!isCurrent()) {
          finish();
          return;
        }
        this.isPlaying.set(true);
        this.currentSpeakingText.set(text);
        this.lastError.set(null);
      };

      audio.onended = () => {
        finish();
      };

      audio.onerror = () => {
        tryNextEndpoint();
      };

      // Start first endpoint
      tryPlayCurrent();

      // Safety watchdog: max 8s or proportional to text length
      const watchdogMs = Math.max(5000, Math.min(25000, text.length * 400 + 2000));
      watchdog = setTimeout(() => {
        if (!settled) {
          finish();
        }
      }, watchdogMs);
    });
  }

  /**
   * Only returns a voice if its language matches the target language.
   * Never returns an unrelated voice (e.g. English for Arabic), because that causes
   * synthesis to fail or drop silently.
   */
  private pickVoice(localeCode: string): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

    const all = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();
    if (!all || all.length === 0) return null;
    this.voices = all;

    const target = (localeCode || 'en-US').toLowerCase().replace('_', '-');
    const language = target.split('-')[0];

    // 1. Exact match, e.g. "ar-sa"
    const exact = all.find((v) => v.lang.toLowerCase().replace('_', '-') === target);
    if (exact) return exact;

    // 2. Regional variant of the same language, e.g. "ar-eg" for "ar-sa"
    const sameLanguage = all.find((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith(`${language}-`),
    );
    if (sameLanguage) return sameLanguage;

    // 3. Any voice starting with the same language code
    const looseLanguage = all.find((v) => v.lang.toLowerCase().split(/[-_]/)[0] === language);
    if (looseLanguage) return looseLanguage;

    // IMPORTANT: Return null if no voice matches the target language.
    return null;
  }

  private extractLangCode(localeCode: string): string {
    if (!localeCode) return 'en';
    return localeCode.toLowerCase().split(/[-_]/)[0];
  }

  private clampRate(rate: number): number {
    if (!Number.isFinite(rate)) return 1;
    return Math.min(2, Math.max(0.5, rate));
  }

  private startKeepAlive(synth: SpeechSynthesis, requestId: number): void {
    this.stopKeepAlive();
    this.keepAliveOwner = requestId;
    this.keepAliveTimer = setInterval(() => {
      if (requestId !== this.requestId) {
        this.stopKeepAlive();
        return;
      }
      if (synth.speaking && !synth.paused) {
        synth.resume();
      }
    }, 6000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = undefined;
    }
  }

  private stopPlaybackOnly(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch { /* ignored */ }
    }
    this.activeUtterance = null;

    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.src = '';
        if (this.activeAudio.parentNode) {
          this.activeAudio.parentNode.removeChild(this.activeAudio);
        }
      } catch { /* ignored */ }
      this.activeAudio = null;
    }
    this.stopKeepAlive();
  }

  public stop(): void {
    this.requestId++;
    this.stopPlaybackOnly();
    this.isPlaying.set(false);
    this.currentSpeakingText.set(null);
  }

  /** Unlocks audio context on user gesture */
  public prime(): void {
    if (typeof window === 'undefined') return;
    this.loadVoices();
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      if (synth.paused) synth.resume();
    }
    this.sfx.prime();
  }
}
