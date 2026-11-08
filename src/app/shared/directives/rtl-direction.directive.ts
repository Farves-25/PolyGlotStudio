import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { ScriptDirection } from '../../core/models/language.model';

@Directive({
  selector: '[appRtlDirection]',
  standalone: true
})
export class RtlDirectionDirective implements OnChanges {
  @Input('appRtlDirection') direction: ScriptDirection | string = 'ltr';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['direction']) {
      const dir = this.direction === 'rtl' ? 'rtl' : 'ltr';
      this.renderer.setAttribute(this.el.nativeElement, 'dir', dir);
      
      if (dir === 'rtl') {
        this.renderer.addClass(this.el.nativeElement, 'rtl-layout');
        this.renderer.removeClass(this.el.nativeElement, 'ltr-layout');
      } else {
        this.renderer.addClass(this.el.nativeElement, 'ltr-layout');
        this.renderer.removeClass(this.el.nativeElement, 'rtl-layout');
      }
    }
  }
}

