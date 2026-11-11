import { Injectable, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  public theme = signal<AppTheme>('light');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('POLYGLOT_THEME') as AppTheme | null;
    // The sunlit light theme is the signature look; only switch to dark when explicitly chosen.
    const initial: AppTheme = stored === 'dark' ? 'dark' : 'light';
    this.setTheme(initial);
  }

  public setTheme(newTheme: AppTheme): void {
    this.theme.set(newTheme);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      if (newTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        body?.classList.add('dark');
        body?.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        body?.classList.remove('dark');
        body?.classList.add('light');
      }
      root.style.colorScheme = newTheme;
      localStorage.setItem('POLYGLOT_THEME', newTheme);
    }
  }

  public toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }
}
