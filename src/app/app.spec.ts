import { describe, it, expect } from 'vitest';
import { SRSEngineService } from './core/services/srs-engine.service';
import { SpeechAnalyzerService } from './core/services/speech-analyzer.service';

describe('PolyglotStudio Algorithm Engine Suite', () => {
  it('should calculate Levenshtein pronunciation accuracy accurately', () => {
    const analyzer = new SpeechAnalyzerService();
    
    // Exact match
    const exact = analyzer.calculateLevenshteinScore('Buenos días', 'Buenos días');
    expect(exact).toBe(100);

    // Minor deviation
    const partial = analyzer.calculateLevenshteinScore('Buenos días', 'Buenos dia');
    expect(partial).toBeGreaterThan(80);

    // Complete mismatch
    const mismatch = analyzer.calculateLevenshteinScore('Guten Tag', 'Bonjour le monde');
    expect(mismatch).toBeLessThan(40);
  });

  it('should execute SuperMemo SM-2 spaced repetition intervals correctly', () => {
    const srs = new SRSEngineService();

    // Rating 4 (Good) from fresh card
    const firstReview = srs.calculateReview(4, {
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      dueDate: '2026-11-07'
    });
    expect(firstReview.repetitions).toBe(1);
    expect(firstReview.intervalDays).toBe(1);

    // Second review
    const secondReview = srs.calculateReview(4, firstReview);
    expect(secondReview.repetitions).toBe(2);
    expect(secondReview.intervalDays).toBe(6);

    // Third review
    const thirdReview = srs.calculateReview(4, secondReview);
    expect(thirdReview.repetitions).toBe(3);
    expect(thirdReview.intervalDays).toBeGreaterThan(6);

    // Fail review (Rating 1) -> reset repetitions
    const failReview = srs.calculateReview(1, thirdReview);
    expect(failReview.repetitions).toBe(0);
    expect(failReview.intervalDays).toBe(1);
  });
});
