import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { AiRoleplayComponent } from '../lesson-studio/components/ai-roleplay/ai-roleplay.component';
import { Exercise, DialogueScenario } from '../../core/models/exercise.model';

interface HubScenario {
  id: string;
  title: string;
  category: 'Travel' | 'Culinary' | 'Professional' | 'Emergency';
  cefr: 'A1' | 'A2' | 'B1' | 'B2';
  icon: string;
  setting: string;
  role: string;
  aiRole: string;
  description: string;
  scenario: DialogueScenario;
}

@Component({
  selector: 'app-roleplay-hub',
  standalone: true,
  imports: [CommonModule, AiRoleplayComponent],
  template: `
    <div class="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="surface-card p-6 md:p-8 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">{{ langService.selectedLanguage().flag_emoji }}</span>
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Contextual Conversational Simulator</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            AI Dialogue & Roleplay Arena
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Engage in authentic real-world dialogues with native AI personas, real-time speech evaluation, and cultural etiquette feedback.
          </p>
        </div>

        <button
          *ngIf="activeScenario()"
          (click)="activeScenario.set(null)"
          class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-mono text-slate-700 dark:text-zinc-300 transition-colors border border-slate-200 dark:border-zinc-700"
        >
          ← Back to All Scenarios
        </button>
      </div>

      <!-- ACTIVE ROLEPLAY CONVERSATION ROOM -->
      <div *ngIf="activeScenario()" class="animate-fadeIn">
        <app-ai-roleplay
          [exercise]="activeExercise!"
          [language]="langService.selectedLanguage()"
        ></app-ai-roleplay>
      </div>

      <!-- SCENARIOS CATALOG GRID (Visible when no active scenario is opened) -->
      <div *ngIf="!activeScenario()" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🎭</span>
            <span>Available Roleplay Scenarios for {{ langService.selectedLanguage().name }}</span>
          </h3>
          <span class="text-xs font-mono text-slate-500 dark:text-zinc-400">{{ scenarios.length }} Simulations Ready</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            *ngFor="let s of scenarios"
            (click)="selectScenario(s)"
            class="surface-card p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:-translate-y-0.5 cursor-pointer group flex flex-col justify-between shadow-xs hover:shadow-md"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  {{ s.icon }}
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {{ s.cefr }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                    {{ s.category }}
                  </span>
                </div>
              </div>

              <h4 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                {{ s.title }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                {{ s.description }}
              </p>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono">
              <span class="text-slate-500 dark:text-zinc-400">Partner: <strong class="text-slate-800 dark:text-zinc-200 font-semibold">{{ s.aiRole }}</strong></span>
              <span class="text-purple-600 dark:text-purple-400 group-hover:underline font-semibold">Start Roleplay →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoleplayHubComponent {
  public langService = inject(LanguageService);
  public activeScenario = signal<HubScenario | null>(null);
  public activeExercise: Exercise | null = null;

  public scenarios: HubScenario[] = [
    {
      id: 'sc-1',
      title: 'Tavern Tapas & Refreshments',
      category: 'Culinary',
      cefr: 'A1',
      icon: '☕',
      setting: 'A sunny terrace bar in central Madrid',
      role: 'Visiting traveler',
      aiRole: 'Camarero (Waiter)',
      description: 'Order authentic regional tapas, espresso, and inquire about ingredients with the local waiter.',
      scenario: {
        title: 'Tavern Tapas in Madrid',
        role: 'Visiting traveler',
        ai_role: 'Camarero (Waiter)',
        setting: 'Sunny outdoor patio near Plaza Mayor',
        initial_ai_message: '¡Hola! Buenos días. ¿Qué le pongo para desayunar hoy?',
        initial_ai_translation: 'Hello! Good morning. What can I get you for breakfast today?',
        suggested_responses: [
          { text: 'Un café con leche y una tostada con tomate, por favor.', translation: 'A coffee with milk and toast with tomato, please.' },
          { text: '¿Tienen zumo de naranja recién exprimido?', translation: 'Do you have freshly squeezed orange juice?' }
        ]
      }
    },
    {
      id: 'sc-2',
      title: 'Tech Interview in Berlin Mitte',
      category: 'Professional',
      cefr: 'B1',
      icon: '💼',
      setting: 'A sleek software studio office overlooking the river',
      role: 'Frontend Engineer Candidate',
      aiRole: 'Lead Architect',
      description: 'Discuss modern reactive architecture, TypeScript, and state management in a professional tech environment.',
      scenario: {
        title: 'Tech Interview in Berlin',
        role: 'Frontend Engineer Candidate',
        ai_role: 'Lead Architect',
        setting: 'Modern tech studio meeting room in Berlin',
        initial_ai_message: 'Willkommen in unserem Büro! Erzählen Sie mir bitte kurz über Ihren Werdegang.',
        initial_ai_translation: 'Welcome to our office! Please tell me briefly about your professional background.',
        suggested_responses: [
          { text: 'Ich habe fünf Jahre Erfahrung in modernem Angular und TypeScript.', translation: 'I have five years of experience in modern Angular and TypeScript.' },
          { text: 'Ich entwickle skalierbare Web-Applikationen mit Fokus auf Performance.', translation: 'I build scalable web applications focused on performance.' }
        ]
      }
    },
    {
      id: 'sc-3',
      title: 'Traditional Ryokan Check-in',
      category: 'Travel',
      cefr: 'A2',
      icon: '🏮',
      setting: 'A peaceful tatami hall in historic Kyoto',
      role: 'Guest',
      aiRole: 'Okami-san (Innkeeper)',
      description: 'Check in, verify luggage handling, and learn dinner schedules with respectful Keigo conventions.',
      scenario: {
        title: 'Ryokan Check-in in Kyoto',
        role: 'Guest',
        ai_role: 'Okami-san (Innkeeper)',
        setting: 'Quiet traditional inn entrance in Kyoto',
        initial_ai_message: 'いらっしゃいませ。京都へようこそ。ご予約のお名前をお伺いしてもよろしいでしょうか？',
        initial_ai_translation: 'Welcome to Kyoto. May I inquire as to your reservation name?',
        suggested_responses: [
          { text: '予約したスミスですが、チェックインをお願いします。', translation: 'I am Smith with a reservation, check-in please.' },
          { text: '夕食の時間は何時からですか？', translation: 'What time is dinner served?' }
        ]
      }
    },
    {
      id: 'sc-4',
      title: 'Spice Market Bargaining (Khan el-Khalili)',
      category: 'Travel',
      cefr: 'A2',
      icon: '🧳',
      setting: 'A fragrant market alley filled with saffron and mint in Cairo',
      role: 'Curious traveler',
      aiRole: 'Spice Merchant',
      description: 'Inquire about saffron quality, barter politely, and exchange traditional Middle Eastern pleasantries.',
      scenario: {
        title: 'Khan el-Khalili Bazaar',
        role: 'Curious traveler',
        ai_role: 'Spice Merchant',
        setting: 'Khan el-Khalili market stall in Cairo',
        initial_ai_message: 'أهلاً وسهلاً بك في دكاني! لدينا أفضل التوابل والأعشاب الطازجة. بماذا يمكنني أن أخدمك اليوم؟',
        initial_ai_translation: 'Welcome to my shop! We have the finest spices and fresh herbs. How can I assist you today?',
        suggested_responses: [
          { text: 'أريد شراء بعض الزعفران والشاي بالنعناع، كم سعر الكيلو؟', translation: 'I want to purchase some saffron and mint tea, what is the price per kilo?' }
        ]
      }
    }
  ];

  selectScenario(s: HubScenario) {
    this.activeScenario.set(s);
    this.activeExercise = {
      id: `ex-hub-${s.id}`,
      lesson_id: 'hub-lesson',
      type: 'dialogue',
      prompt: s.title,
      target_text: s.scenario.initial_ai_message,
      order_index: 1,
      dialogue_scenario: s.scenario
    };
  }
}

