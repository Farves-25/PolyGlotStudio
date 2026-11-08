export type ScriptDirection = 'ltr' | 'rtl';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface Language {
  id: string; // 'es', 'de', 'ja', 'ar', 'fr', 'ta'
  name: string;
  native_name: string;
  flag_emoji: string;
  script_direction: ScriptDirection;
  locale_code: string;
  accent_color?: string;
  badge_gradient?: string;
  tagline?: string;
  difficulty?: 'Beginner-Friendly' | 'Moderate' | 'Challenging' | 'Expert';
}

export interface Lesson {
  id: string;
  language_id: string;
  title: string;
  cefr_level: CefrLevel;
  topic: string;
  order_index: number;
  description?: string;
  exercise_count?: number;
  estimated_minutes?: number;
}

