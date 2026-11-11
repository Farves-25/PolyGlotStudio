import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { HeaderComponent } from './core/components/header/header.component';
import { CommandPaletteComponent } from './core/components/command-palette/command-palette.component';
import { SupabaseConfigModalComponent } from './features/supabase-config-modal/supabase-config-modal.component';
import { ToastService } from './core/services/toast.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    CommandPaletteComponent,
    SupabaseConfigModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public toastService = inject(ToastService);
  public auth = inject(AuthService);
  private router = inject(Router);

  public showSpotlight = signal<boolean>(false);
  public showSupabaseModal = signal<boolean>(false);
  public isStudioView = signal<boolean>(false);

  constructor() {
    const isPublicRoute = (path: string): boolean =>
      path === '/' ||
      path.startsWith('/welcome') ||
      path.startsWith('/onboarding') ||
      path.startsWith('/learn') ||
      path.startsWith('/quiz');

    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      this.isStudioView.set(!isPublicRoute(p));
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.isStudioView.set(!isPublicRoute(url));
    });
  }

  @HostListener('window:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent) {
    // Ctrl + K or Cmd + K opens the spotlight palette
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.showSpotlight.update(s => !s);
    }
  }

  openSpotlight() {
    this.showSpotlight.set(true);
  }

  closeSpotlight() {
    this.showSpotlight.set(false);
  }

  openSupabase() {
    this.showSupabaseModal.set(true);
  }

  closeSupabase() {
    this.showSupabaseModal.set(false);
  }
}
