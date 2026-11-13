import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { UserProgressService } from '../../core/services/user-progress.service';
import { AudioSfxService } from '../../core/services/audio-sfx.service';

interface CurriculumTrackMilestone {
  stepNumber: number;
  title: string;
  cefr: string;
  category: string;
  icon: string;
  route: string;
  description: string;
  keySkills: string[];
  status: 'active' | 'completed' | 'available';
}

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
              {{ langService.selectedLanguage().name }} Complete Course Curriculum
            </span>
          </div>
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comprehensive Course Roadmap
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            A pedagogically structured path from orthography and script fundamentals to advanced conversational fluency.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <a
            routerLink="/dashboard"
            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Dashboard</span>
          </a>
          <a
            routerLink="/alphabet"
            class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>Start Step 1 (Alphabet)</span>
            <span>→</span>
          </a>
        </div>
      </div>

      <!-- Course Track Stepper Cards -->
      <div class="space-y-6">
        <div
          *ngFor="let milestone of courseMilestones(); let idx = index"
          class="surface-card p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 transition-all hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md relative overflow-hidden group"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <!-- Left: Step number & Icon & Details -->
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex flex-col items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <span class="text-2xl select-none">{{ milestone.icon }}</span>
                <span class="text-[9px] font-mono font-black text-indigo-700 dark:text-indigo-300">STEP {{ milestone.stepNumber }}</span>
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    {{ milestone.category }}
                  </span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    CEFR {{ milestone.cefr }}
                  </span>
                </div>

                <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {{ milestone.title }}
                </h3>
                <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  {{ milestone.description }}
                </p>

                <!-- Key Skills Badges -->
                <div class="flex flex-wrap gap-1.5 mt-3">
                  <span
                    *ngFor="let skill of milestone.keySkills"
                    class="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-[10px] font-mono text-slate-600 dark:text-zinc-400"
                  >
                    ✓ {{ skill }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Action CTA -->
            <div class="shrink-0 flex items-center md:flex-col justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800">
              <a
                [routerLink]="milestone.route"
                (click)="playClick()"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all hover:translate-x-0.5 flex items-center gap-1.5 active:scale-95"
              >
                <span>Launch Module</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Module Progression Bar -->
      <div class="surface-card p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 class="text-[10px] font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400">Next Recommended Action</h4>
          <div class="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
            Master the letters and writing system for {{ langService.selectedLanguage().name }}
          </div>
        </div>
        <div class="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            routerLink="/dashboard"
            class="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ← Dashboard
          </a>
          <a
            routerLink="/alphabet"
            class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            Alphabet & Script Studio →
          </a>
        </div>
      </div>
    </div>
  `
})
export class CurriculumComponent {
  public langService = inject(LanguageService);
  public progress = inject(UserProgressService);
  private sfx = inject(AudioSfxService);

  public courseMilestones = computed<CurriculumTrackMilestone[]>(() => {
    const lang = this.langService.selectedLanguage();
    const langId = lang.id;

    return [
      {
        stepNumber: 1,
        title: `Alphabet, Script & Letter Pronunciation`,
        cefr: 'A1',
        category: 'Orthography & Writing',
        icon: '🔤',
        route: '/alphabet',
        description: `Learn the complete ${lang.name} writing system: vowels, consonants, letter names, diacritics, and native tap-to-listen acoustic articulation.`,
        keySkills: ['Letter Identification', 'Native IPA Phonics', 'Ear Training Recognition', 'Isolated & Positional Forms'],
        status: 'active'
      },
      {
        stepNumber: 2,
        title: 'Acoustic Phonetics & Minimal Pair Studio',
        cefr: 'A1-A2',
        category: 'Phonology & Speech',
        icon: '🔬',
        route: '/phonetics',
        description: `Train your ear to discriminate subtle minimal sound contrasts, regional vowel placements, and consonant articulations in ${lang.name}.`,
        keySkills: ['IPA Chart Matrix', 'Minimal Sound Pairs', 'Vowel Openness', 'Acoustic Discrimination'],
        status: 'available'
      },
      {
        stepNumber: 3,
        title: 'Morphological Syntax & Grammar Matrix',
        cefr: 'A2',
        category: 'Grammar & Syntax',
        icon: '🧩',
        route: '/grammar',
        description: `Understand the fundamental architecture of ${lang.name}: word order typology, gender agreements, cases, and interactive verb conjugation engine.`,
        keySkills: ['Sentence Typology', 'Pronoun-Verb Agreement', 'Core Verb Tenses', 'Constituent Word Order'],
        status: 'available'
      },
      {
        stepNumber: 4,
        title: 'Categorized Vocabulary Vault (SM-2 Spaced Recall)',
        cefr: 'A1-B1',
        category: 'Lexicon Mastery',
        icon: '📚',
        route: '/vocabulary',
        description: `High-yield vocabulary decks arranged by 10+ thematic categories (Numbers, Dining, Travel, Time, Family...) with interactive flashcards.`,
        keySkills: ['Thematic Classification', 'SM-2 Memory Scheduling', 'Contextual Sentences', 'Deck Export'],
        status: 'available'
      },
      {
        stepNumber: 5,
        title: 'Real-World Travel & Daily Life Phrasebook',
        cefr: 'A2-B1',
        category: 'Applied Dialogues',
        icon: '📖',
        route: `/learn/${langId}`,
        description: `420+ authentic real-life phrases across 14 interactive situations (cafés, taxis, hotels, shopping, emergencies) with native audio playback.`,
        keySkills: ['14 Scenario Topics', 'Instant Audio Playback', 'Slow Speech Mode', 'Situational Comprehension'],
        status: 'available'
      },
      {
        stepNumber: 6,
        title: 'AI Dialogue Arena & Interactive Studio',
        cefr: 'B1-B2',
        category: 'Conversational Fluency',
        icon: '🎭',
        route: '/roleplay',
        description: `Engage with interactive native AI personas in simulated cultural settings with immediate speech feedback, tone analysis, and etiquette ratings.`,
        keySkills: ['Simulated Cultural Dialogues', 'Acoustic Waveform Analysis', 'Levenshtein Match Scoring', 'Conversational Confidence'],
        status: 'available'
      }
    ];
  });

  playClick() {
    this.sfx.playCardFlip();
  }
}
