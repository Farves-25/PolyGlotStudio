import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

/**
 * Mouse-following 3D tilt with a soft glare highlight.
 * Add the `tilt-shine` class to the same element to reveal the glare.
 */
@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective {
  @Input() tiltMax = 8;
  @Input() tiltScale = 1.015;

  private el = inject(ElementRef<HTMLElement>);

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const node = this.el.nativeElement;
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - py) * this.tiltMax * 2;
    const rotateY = (px - 0.5) * this.tiltMax * 2;

    node.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${this.tiltScale})`;
    node.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
    node.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
  }

  @HostListener('mouseleave')
  reset(): void {
    const node = this.el.nativeElement;
    node.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  }
}
