import { Injectable, signal, computed } from '@angular/core';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'phonetics' | 'streak' | 'syntax' | 'roleplay' | 'srs';
}

export interface ActivityDay {
  date: string;
  count: number; // 0 to 4 intensity
}

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  private readonly STORAGE_KEY = 'POLYGLOT_USER_PROFILE';

  public xp = signal<number>(1420);
  public streak = signal<number>(12);
  public gems = signal<number>(450);
  public dailyGoalMinutes = signal<number>(20);
  public minutesToday = signal<number>(14);

  public level = computed(() => Math.floor(this.xp() / 250) + 1);
  public xpForNextLevel = computed(() => this.level() * 250);
  public levelProgressPercent = computed(() => {
    const currentLevelXp = this.xp() % 250;
    return Math.round((currentLevelXp / 250) * 100);
  });

  public achievements = signal<Achievement[]>([
    {
      id: 'phoneme_pioneer',
      title: 'Phoneme Pioneer',
      description: 'Achieve >95% accuracy score on native pronunciation matching',
      icon: '🎙️',
      unlocked: true,
      unlockedAt: '2026-11-04',
      category: 'phonetics'
    },
    {
      id: 'syntax_architect',
      title: 'Syntax Architect',
      description: 'Dissect and reconstruct 10 constituent grammar puzzles',
      icon: '🧩',
      unlocked: true,
      unlockedAt: '2026-11-05',
      category: 'syntax'
    },
    {
      id: 'streak_titan',
      title: 'Streak Titan',
      description: 'Maintain a 10-day continuous study habit',
      icon: '🔥',
      unlocked: true,
      unlockedAt: '2026-11-06',
      category: 'streak'
    },
    {
      id: 'srs_master',
      title: 'Memory Vault Master',
      description: 'Review 50 Spaced Repetition flashcards with SuperMemo SM-2',
      icon: '🗂️',
      unlocked: false,
      category: 'srs'
    },
    {
      id: 'diplomat',
      title: 'Cultural Diplomat',
      description: 'Converse fluently through 5 contextual AI roleplay scenarios',
      icon: '🎭',
      unlocked: false,
      category: 'roleplay'
    }
  ]);

  constructor() {
    this.loadProfile();
  }

  private loadProfile() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.xp) this.xp.set(parsed.xp);
        if (parsed.streak) this.streak.set(parsed.streak);
        if (parsed.gems) this.gems.set(parsed.gems);
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }
  }

  private saveProfile() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          xp: this.xp(),
          streak: this.streak(),
          gems: this.gems()
        })
      );
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  }

  public addXp(amount: number) {
    this.xp.update(x => x + amount);
    this.gems.update(g => g + Math.max(1, Math.floor(amount / 10)));
    this.saveProfile();
  }

  public getActivityHeatmap(): ActivityDay[] {
    const days: ActivityDay[] = [];
    const today = new Date();
    // Generate past 84 days (12 weeks)
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      // Deterministic activity variation for authentic display
      const pseudoHash = (d.getDate() * 7 + d.getMonth() * 13) % 5;
      days.push({
        date: iso,
        count: i === 0 ? 3 : pseudoHash
      });
    }
    return days;
  }

  public reset(): void {
    this.xp.set(0);
    this.streak.set(0);
    this.gems.set(0);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch { /* ignored */ }
  }
}

