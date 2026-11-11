import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioSfxService {
  private audioCtx: AudioContext | null = null;
  public soundEnabled = signal<boolean>(true);

  constructor() {
    // Browsers start AudioContext in a suspended state until the first user
    // gesture. Warm it up on any interaction so the first button click is not
    // silent due to a race with resume().
    if (typeof document === 'undefined') return;
    const unlock = () => {
      this.prime();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchstart', unlock, { passive: true });
  }

  public prime(): void {
    const ctx = this.getContext();
    if (ctx && ctx.state !== 'running') {
      void ctx.resume().catch(() => { /* ignored */ });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      } catch (error) {
        console.warn('[SFX] Web Audio is unavailable:', error);
        return null;
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume().catch(() => { /* ignored */ });
    }
    return this.audioCtx;
  }

  /**
   * Runs a sound only once the AudioContext is actually running. Scheduling
   * oscillators while the context is still suspended can produce silence.
   */
  private whenRunning(play: (ctx: AudioContext) => void): void {
    if (!this.soundEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'running') {
      play(ctx);
      return;
    }

    ctx
      .resume()
      .then(() => play(ctx))
      .catch(() => {
        /* Autoplay still blocked: stay silent instead of throwing. */
      });
  }

  public playSuccess() {
    this.whenRunning((ctx) => {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    });
  }

  public playError() {
    this.whenRunning((ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  public playCardFlip() {
    this.whenRunning((ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    });
  }

  public playWhoosh() {
    this.playCardFlip();
  }

  public playLevelUp() {
    this.whenRunning((ctx) => {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + i * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    });
  }

  public playFanfare() {
    this.playLevelUp();
  }

  public toggleSound() {
    const next = !this.soundEnabled();
    this.soundEnabled.set(next);
    if (next) {
      // Give immediate feedback that sound is back on.
      this.prime();
      this.playCardFlip();
    }
  }
}
