import { Directive, ElementRef, Input, OnDestroy, OnInit, inject, NgZone } from '@angular/core';

/**
 * High-performance mouse-following 3D tilt with a soft glare highlight.
 * Runs completely outside Angular zone with requestAnimationFrame throttling
 * to avoid triggering change detection on every pixel movement.
 */
@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective implements OnInit, OnDestroy {
  @Input() tiltMax = 8;
  @Input() tiltScale = 1.015;

  private el = inject(ElementRef<HTMLElement>);
  private ngZone = inject(NgZone);
  private rafId: number | null = null;
  private unlisteners: Array<() => void> = [];

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    this.ngZone.runOutsideAngular(() => {
      const node = this.el.nativeElement;

      const onMouseMove = (event: MouseEvent) => {
        if (this.rafId !== null) return;
        this.rafId = requestAnimationFrame(() => {
          this.rafId = null;
          const rect = node.getBoundingClientRect();
          if (!rect.width || !rect.height) return;

          const px = (event.clientX - rect.left) / rect.width;
          const py = (event.clientY - rect.top) / rect.height;

          const rotateX = (0.5 - py) * this.tiltMax * 2;
          const rotateY = (px - 0.5) * this.tiltMax * 2;

          node.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${this.tiltScale})`;
          node.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
          node.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
        });
      };

      const onMouseLeave = () => {
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
        node.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      };

      node.addEventListener('mousemove', onMouseMove, { passive: true });
      node.addEventListener('mouseleave', onMouseLeave, { passive: true });

      this.unlisteners.push(
        () => node.removeEventListener('mousemove', onMouseMove),
        () => node.removeEventListener('mouseleave', onMouseLeave)
      );
    });
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.unlisteners.forEach(fn => fn());
    this.unlisteners = [];
  }
}
