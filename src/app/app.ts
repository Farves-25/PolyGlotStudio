import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { HeaderComponent } from './core/components/header/header.component';
import { CommandPaletteComponent } from './core/components/command-palette/command-palette.component';
import { SupabaseConfigModalComponent } from './features/supabase-config-modal/supabase-config-modal.component';
import { ToastService } from './core/services/toast.service';

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
  public showSpotlight = signal<boolean>(false);
  public showSupabaseModal = signal<boolean>(false);

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
