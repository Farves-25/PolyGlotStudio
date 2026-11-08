import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserSrsProgress } from '../models/exercise.model';

export interface SRSMetrics {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;
}

@Injectable({ providedIn: 'root' })
export class SRSEngineService {
  private supabase: SupabaseService | null = null;

  // Cache in-memory / local storage
  public userProgressMap = signal<Record<string, UserSrsProgress>>({});
  private readonly STORAGE_KEY = 'POLYGLOT_SRS_PROGRESS';

  constructor() {
    try {
      this.supabase = inject(SupabaseService, { optional: true });
    } catch {
      // Running outside Angular injection context (e.g. isolated unit tests)
      this.supabase = null;
    }
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.userProgressMap.set(JSON.parse(data));
      }
    } catch (e) {
      console.warn('Failed to parse SRS progress from localStorage', e);
    }
  }

  private saveToLocalStorage(map: Record<string, UserSrsProgress>) {
    if (typeof localStorage === 'undefined') {
      this.userProgressMap.set(map);
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(map));
      this.userProgressMap.set(map);
    } catch (e) {
      console.warn('Failed to save SRS progress to localStorage', e);
    }
  }

  /**
   * SuperMemo SM-2 Algorithm Implementation
   * Rating scale:
   * 0-2 = Fail (Reset repetitions)
   * 3 = Pass (Hard)
   * 4 = Good
   * 5 = Easy
   */
  public calculateReview(rating: number, current: SRSMetrics): SRSMetrics {
    let { easeFactor, repetitions, intervalDays } = current;

    if (rating < 3) {
      repetitions = 0;
      intervalDays = 1;
    } else {
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      repetitions++;
    }

    easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    return {
      easeFactor: Number(easeFactor.toFixed(2)),
      intervalDays,
      repetitions,
      dueDate: nextDate.toISOString().split('T')[0]
    };
  }

  public getProgressForExercise(exerciseId: string): UserSrsProgress {
    const currentMap = this.userProgressMap();
    if (currentMap[exerciseId]) {
      return currentMap[exerciseId];
    }
    const today = new Date().toISOString().split('T')[0];
    return {
      user_id: this.supabase?.getActiveUserId() || 'local-demo-user',
      exercise_id: exerciseId,
      ease_factor: 2.5,
      interval_days: 1,
      repetitions: 0,
      due_date: today
    };
  }

  public async recordReview(exerciseId: string, rating: number): Promise<UserSrsProgress> {
    const current = this.getProgressForExercise(exerciseId);
    const updatedMetrics = this.calculateReview(rating, {
      easeFactor: current.ease_factor,
      intervalDays: current.interval_days,
      repetitions: current.repetitions,
      dueDate: current.due_date
    });

    const updatedProgress: UserSrsProgress = {
      ...current,
      ease_factor: updatedMetrics.easeFactor,
      interval_days: updatedMetrics.intervalDays,
      repetitions: updatedMetrics.repetitions,
      due_date: updatedMetrics.dueDate,
      last_reviewed: new Date().toISOString()
    };

    // Save locally
    const currentMap = { ...this.userProgressMap() };
    currentMap[exerciseId] = updatedProgress;
    this.saveToLocalStorage(currentMap);

    // Sync to Supabase if configured
    if (this.supabase?.client && this.supabase.isConfigured()) {
      try {
        await this.supabase.client.from('user_srs_progress').upsert(
          {
            user_id: this.supabase.getActiveUserId(),
            exercise_id: exerciseId,
            ease_factor: updatedProgress.ease_factor,
            interval_days: updatedProgress.interval_days,
            repetitions: updatedProgress.repetitions,
            due_date: updatedProgress.due_date,
            last_reviewed: updatedProgress.last_reviewed
          },
          { onConflict: 'user_id,exercise_id' }
        );
      } catch (err) {
        console.warn('SRS Supabase sync failed, local progress preserved:', err);
      }
    }

    return updatedProgress;
  }

  public getDueReviewCount(): number {
    const today = new Date().toISOString().split('T')[0];
    const map = this.userProgressMap();
    let count = 0;
    for (const key in map) {
      if (map[key].due_date <= today) {
        count++;
      }
    }
    return count;
  }
}

