import { Component, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { ToastService } from '../../services/toast.service';
import { TextToSpeechService } from '../../services/text-to-speech.service';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Languages' | 'Quick Actions';
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm animate-fadeIn" (click)="onBackdropClick($event)">
      <div class="surface-card w-full max-w-2xl rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col" (click)="$event.stopPropagation()">
        
        <!-- Search Input Bar -->
        <div class="flex items-center gap-3 p-4 border-b border-slate-200/80 dark:border-zinc-800/80">
          <span class="text-xl text-slate-400 dark:text-zinc-500">🔍</span>
          <input
            #searchBox
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Type a command, page, or language (e.g. 'Spanish', 'Vocabulary', 'Arabic')..."
            class="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none text-sm md:text-base font-medium"
            autofocus
          />
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            ESC
          </span>
        </div>

        <!-- Commands List -->
        <div class="max-h-[380px] overflow-y-auto p-2 space-y-1">
          <div *ngIf="filteredCommands().length === 0" class="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 font-mono">
            No matching commands or actions found for "{{ searchQuery }}"
          </div>

          <button
            *ngFor="let item of filteredCommands(); let i = index"
            (click)="execute(item)"
            class="w-full text-left p-3 rounded-xl flex items-center justify-between group hover:bg-indigo-50/80 dark:hover:bg-indigo-500/15 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl select-none">{{ item.icon }}</span>
              <div>
                <div class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                  {{ item.title }}
                </div>
                <div class="text-[11px] text-slate-500 dark:text-zinc-400">
                  {{ item.subtitle }}
                </div>
              </div>
            </div>

            <span class="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
              {{ item.category }}
            </span>
          </button>
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-slate-200/80 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
          <div class="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span class="text-indigo-600 dark:text-indigo-400 font-semibold">Polyglot Spotlight</span>
        </div>
      </div>
    </div>
  `
})
export class CommandPaletteComponent {
  @Output() close = new EventEmitter<void>();

  private router = inject(Router);
  private langService = inject(LanguageService);
  private toast = inject(ToastService);
  private tts = inject(TextToSpeechService);

  public searchQuery = '';

  private commands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Dashboard & Analytics',
      subtitle: 'View your CEFR radar, study streak, and 365-day heatmap',
      category: 'Navigation',
      icon: '📊',
      action: () => this.router.navigate(['/dashboard'])
    },
    {
      id: 'nav-curriculum',
      title: 'Curriculum Roadmap',
      subtitle: 'Explore learning path nodes, checkpoints, and unit progression',
      category: 'Navigation',
      icon: '🗺️',
      action: () => this.router.navigate(['/curriculum'])
    },
    {
      id: 'nav-studio',
      title: 'Interactive Studio',
      subtitle: 'Run speech recognition, syntax dissector, and SRS cards',
      category: 'Navigation',
      icon: '🎙️',
      action: () => this.router.navigate(['/studio'])
    },
    {
      id: 'nav-vocab',
      title: 'Vocabulary Vault',
      subtitle: 'Master and search your active lexicon and SRS metrics',
      category: 'Navigation',
      icon: '📚',
      action: () => this.router.navigate(['/vocabulary'])
    },
    {
      id: 'nav-phonetics',
      title: 'Phonetics & IPA Lab',
      subtitle: 'Master minimal pairs, vowel charts, and acoustic intonation',
      category: 'Navigation',
      icon: '🔬',
      action: () => this.router.navigate(['/phonetics'])
    },
    {
      id: 'nav-grammar',
      title: 'Grammar Matrix',
      subtitle: 'Conjugate verbs and examine case/particle structures',
      category: 'Navigation',
      icon: '🧩',
      action: () => this.router.navigate(['/grammar'])
    },
    {
      id: 'nav-roleplay',
      title: 'AI Dialogue Arena',
      subtitle: 'Simulate immersive conversations with native AI characters',
      category: 'Navigation',
      icon: '🎭',
      action: () => this.router.navigate(['/roleplay'])
    },
    {
      id: 'nav-leaderboard',
      title: 'Diamond League Leaderboard',
      subtitle: 'Check your global ranking and XP competition standings',
      category: 'Navigation',
      icon: '🏆',
      action: () => this.router.navigate(['/leaderboard'])
    },
    {
      id: 'nav-settings',
      title: 'Settings & Database Configuration',
      subtitle: 'Manage Supabase credentials, audio velocity, and export SQL',
      category: 'Navigation',
      icon: '⚙️',
      action: () => this.router.navigate(['/settings'])
    },

    // Language switchers
    {
      id: 'lang-es',
      title: 'Switch to Spanish (Español)',
      subtitle: 'Castilian phonetics and Madrid tapas bar dialogues',
      category: 'Languages',
      icon: '🇪🇸',
      action: () => {
        this.langService.selectLanguage('es');
        this.toast.show('Switched target language to Spanish (Español)', 'success');
      }
    },
    {
      id: 'lang-de',
      title: 'Switch to German (Deutsch)',
      subtitle: 'V2 word order and Berlin tech interview dialogues',
      category: 'Languages',
      icon: '🇩🇪',
      action: () => {
        this.langService.selectLanguage('de');
        this.toast.show('Switched target language to German (Deutsch)', 'success');
      }
    },
    {
      id: 'lang-ja',
      title: 'Switch to Japanese (日本語)',
      subtitle: 'SOV particles and Kyoto ryokan dialogues',
      category: 'Languages',
      icon: '🇯🇵',
      action: () => {
        this.langService.selectLanguage('ja');
        this.toast.show('Switched target language to Japanese (日本語)', 'success');
      }
    },
    {
      id: 'lang-ar',
      title: 'Switch to Arabic (العربية - Native RTL)',
      subtitle: 'Right-to-Left layout with Cairo bazaar dialogues',
      category: 'Languages',
      icon: '🇸🇦',
      action: () => {
        this.langService.selectLanguage('ar');
        this.toast.show('Switched target language to Arabic (Native RTL)', 'success');
      }
    },
    {
      id: 'lang-fr',
      title: 'Switch to French (Français)',
      subtitle: 'Nasal vowels and Paris boulangerie dialogues',
      category: 'Languages',
      icon: '🇫🇷',
      action: () => {
        this.langService.selectLanguage('fr');
        this.toast.show('Switched target language to French (Français)', 'success');
      }
    },
    {
      id: 'lang-ta',
      title: 'Switch to Tamil (தமிழ்)',
      subtitle: 'Agglutinative grammar and Chennai cafe dialogues',
      category: 'Languages',
      icon: '🇮🇳',
      action: () => {
        this.langService.selectLanguage('ta');
        this.toast.show('Switched target language to Tamil (தமிழ்)', 'success');
      }
    }
  ];

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    this.close.emit();
  }

  filteredCommands(): CommandItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.commands;
    return this.commands.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }

  execute(item: CommandItem) {
    item.action();
    this.close.emit();
  }
}

