import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-audio-visualizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-28 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-inner transition-colors">
      <canvas #waveformCanvas class="w-full h-full block"></canvas>
      
      <!-- Overlay live status indicator & Mode Toggle -->
      <div class="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-auto">
        <span class="relative flex h-2 w-2">
          <span
            *ngIf="isActive"
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"
          ></span>
          <span
            class="relative inline-flex rounded-full h-2 w-2"
            [ngClass]="isActive ? 'bg-rose-500' : 'bg-slate-400 dark:bg-zinc-600'"
          ></span>
        </span>
        <span class="text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-500 dark:text-zinc-400">
          {{ isActive ? 'Live Web Audio' : 'Oscilloscope Standby' }}
        </span>

        <!-- Spectrum vs Waveform Switcher -->
        <button
          (click)="toggleVisualizerMode()"
          class="ml-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase transition-all border"
          [ngClass]="visualizerMode === 'spectrum' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/40' : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'"
        >
          {{ visualizerMode === 'spectrum' ? 'FFT Spectrum' : 'Oscilloscope' }}
        </button>
      </div>

      <!-- Mode & Frequency details -->
      <div class="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono text-slate-400 dark:text-zinc-500 flex items-center gap-2">
        <span *ngIf="peakVolume > 0" class="text-indigo-600 dark:text-indigo-400 font-bold">Vol: {{ peakVolume }}%</span>
        <span>{{ isActive ? '48kHz • 128 FFT' : 'Stereo Audio Bus' }}</span>
      </div>
    </div>
  `
})
export class AudioVisualizerComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('waveformCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() isActive = false;
  @Input() accentColor = '#ffd21e';

  public themeService = inject(ThemeService);
  public visualizerMode: 'waveform' | 'spectrum' = 'spectrum';
  public peakVolume = 0;

  private animationFrameId: number | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private freqArray: Uint8Array | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private phase = 0;

  toggleVisualizerMode() {
    this.visualizerMode = this.visualizerMode === 'waveform' ? 'spectrum' : 'waveform';
  }

  ngOnInit(): void {
    this.setupResizeObserver();
    this.startCanvasRenderLoop();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isActive']) {
      if (this.isActive) {
        this.startMicrophoneCapture();
      } else {
        this.stopMicrophoneCapture();
      }
    }
  }

  private setupResizeObserver(): void {
    const canvas = this.canvasRef.nativeElement;
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    this.resizeObserver.observe(canvas.parentElement || canvas);
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }

  private async startMicrophoneCapture(): Promise<void> {
    try {
      if (!this.audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        source.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.freqArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    } catch (err) {
      console.warn('[AudioVisualizer] Microphone access unavailable, using fluid audio simulation:', err);
      // Fluid simulation will seamlessly take over
    }
  }

  private stopMicrophoneCapture(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  private startCanvasRenderLoop(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Render subtle horizontal center baseline
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (this.isActive && this.analyser && this.dataArray && this.freqArray) {
        if (this.visualizerMode === 'spectrum') {
          // Real-time FFT Frequency Spectrum Bars
          this.analyser.getByteFrequencyData(this.freqArray as any);
          const barCount = 48;
          const barWidth = (width / barCount) * 0.7;
          const barSpacing = (width / barCount) * 0.3;

          let sumVol = 0;
          for (let i = 0; i < barCount; i++) {
            const rawVal = this.freqArray[i] || 0;
            sumVol += rawVal;
            const barHeight = (rawVal / 255.0) * (height * 0.85);
            const x = i * (barWidth + barSpacing) + barSpacing;
            const y = height - barHeight;

            const grad = ctx.createLinearGradient(0, height, 0, y);
            grad.addColorStop(0, '#ffd21e');
            grad.addColorStop(0.6, '#f5b800');
            grad.addColorStop(1, '#fb923c');
            ctx.fillStyle = grad;

            // Rounded bars
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
            ctx.fill();
          }
          this.peakVolume = Math.round((sumVol / (barCount * 255)) * 100);
        } else {
          // Real-time microphone waveform from AnalyserNode
          this.analyser.getByteTimeDomainData(this.dataArray as any);

          ctx.lineWidth = 2.5;
          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, '#ffd21e');
          gradient.addColorStop(0.5, '#f5b800');
          gradient.addColorStop(1, '#fb923c');
          ctx.strokeStyle = gradient;
          ctx.shadowColor = '#f5b800';
          ctx.shadowBlur = 12;

          ctx.beginPath();
          const sliceWidth = (width * 1.0) / this.dataArray.length;
          let x = 0;

          for (let i = 0; i < this.dataArray.length; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = (v * height) / 2;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.lineTo(width, height / 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else if (this.isActive) {
        // Fluid simulation when active (e.g., mic permission pending or simulated mode)
        this.phase += 0.08;

        if (this.visualizerMode === 'spectrum') {
          const barCount = 42;
          const barWidth = (width / barCount) * 0.7;
          const barSpacing = (width / barCount) * 0.3;

          for (let i = 0; i < barCount; i++) {
            const norm = i / barCount;
            const env = Math.sin(norm * Math.PI);
            const val = Math.abs(Math.sin(norm * 12 + this.phase * 2)) * 0.75 + Math.cos(norm * 6 - this.phase) * 0.25;
            const barHeight = Math.max(4, val * env * (height * 0.85));
            const x = i * (barWidth + barSpacing) + barSpacing;
            const y = height - barHeight;

            const grad = ctx.createLinearGradient(0, height, 0, y);
            grad.addColorStop(0, '#f43f5e');
            grad.addColorStop(0.5, '#ec4899');
            grad.addColorStop(1, '#8b5cf6');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
            ctx.fill();
          }
          this.peakVolume = 65;
        } else {
          ctx.lineWidth = 3;
          const gradient = ctx.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, '#f43f5e');
          gradient.addColorStop(0.5, '#ec4899');
          gradient.addColorStop(1, '#8b5cf6');
          ctx.strokeStyle = gradient;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 14;

          ctx.beginPath();
          for (let x = 0; x < width; x += 3) {
            const normX = x / width;
            const envelope = Math.sin(normX * Math.PI);
            const wave1 = Math.sin(normX * 18 + this.phase) * (height * 0.28);
            const wave2 = Math.cos(normX * 8 - this.phase * 1.4) * (height * 0.14);
            const y = height / 2 + (wave1 + wave2) * envelope;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else {
        // Idle gentle breathing sine wave
        this.phase += 0.02;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';

        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const normX = x / width;
          const envelope = Math.sin(normX * Math.PI);
          const y = height / 2 + Math.sin(normX * 8 + this.phase) * 6 * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    render();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.stopMicrophoneCapture();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

