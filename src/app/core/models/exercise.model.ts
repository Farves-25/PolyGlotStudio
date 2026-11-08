export type ExerciseType = 'pronunciation' | 'syntax_dissector' | 'srs_card' | 'dialogue';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'pronoun'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'particle'
  | 'article'
  | 'determiner'
  | 'case-marker';

export interface SyntaxToken {
  token: string;
  pos: PartOfSpeech | string;
  meaning: string;
  root_form?: string;
  grammar_note?: string;
  highlight_color?: string;
}

export interface DialogueMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  translation: string;
  phonetic?: string;
  audio_url?: string;
  correction?: string;
  cultural_tip?: string;
}

export interface DialogueScenario {
  title: string;
  role: string;
  ai_role: string;
  setting: string;
  initial_ai_message: string;
  initial_ai_translation: string;
  suggested_responses: { text: string; translation: string }[];
}

export interface Exercise {
  id: string;
  lesson_id: string;
  type: ExerciseType;
  prompt: string;
  target_text: string;
  phonetic_guide?: string;
  syntax_tokens?: SyntaxToken[];
  audio_url?: string;
  order_index: number;
  translation?: string;
  cultural_context?: string;
  dialogue_scenario?: DialogueScenario;
}

export interface UserSrsProgress {
  id?: string;
  user_id: string;
  exercise_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: string;
  last_reviewed?: string;
}

export interface RoleplaySession {
  id?: string;
  user_id: string;
  language_id: string;
  scenario: string;
  messages: DialogueMessage[];
  created_at?: string;
}

