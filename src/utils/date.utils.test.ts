import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateNextRenewal,
  addCycle,
  getDaysUntil,
  formatRelativeDate,
  formatShortDate,
  isWithinDays,
  isPast,
} from './date.utils';

describe('date.utils', () => {
  beforeEach(() => {
    // Mock current date to 2025-01-15
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addCycle', () => {
    it('adds 7 days for weekly cycle', () => {
      const date = new Date('2025-01-01');
      const result = addCycle(date, 'weekly');
      expect(result.toISOString().split('T')[0]).toBe('2025-01-08');
    });

    it('adds 1 month for monthly cycle', () => {
      const date = new Date('2025-01-15');
      const result = addCycle(date, 'monthly');
      expect(result.toISOString().split('T')[0]).toBe('2025-02-15');
    });

    it('adds 3 months for quarterly cycle', () => {
      const date = new Date('2025-01-15');
      const result = addCycle(date, 'quarterly');
      expect(result.toISOString().split('T')[0]).toBe('2025-04-15');
    });

    it('adds 1 year for yearly cycle', () => {
      const date = new Date('2025-01-15');
      const result = addCycle(date, 'yearly');
      expect(result.toISOString().split('T')[0]).toBe('2026-01-15');
    });
  });

  describe('calculateNextRenewal', () => {
    it('calculates next monthly renewal in the future', () => {
      const result = calculateNextRenewal('2025-01-10', 'monthly');
      expect(result).toBe('2025-02-10');
    });

    it('calculates next renewal when start date is today', () => {
      const result = calculateNextRenewal('2025-01-15', 'monthly');
      expect(result).toBe('2025-02-15');
    });

    it('skips past dates to find next future renewal', () => {
      const result = calculateNextRenewal('2024-06-15', 'monthly');
      expect(result).toBe('2025-02-15');
    });

    it('calculates yearly renewal correctly', () => {
      const result = calculateNextRenewal('2024-03-01', 'yearly');
      expect(result).toBe('2025-03-01');
    });
  });

  describe('getDaysUntil', () => {
    it('returns positive days for future date', () => {
      expect(getDaysUntil('2025-01-20')).toBe(5);
    });

    it('returns 0 for today', () => {
      expect(getDaysUntil('2025-01-15')).toBe(0);
    });

    it('returns negative for past dates', () => {
      expect(getDaysUntil('2025-01-10')).toBe(-5);
    });

    it('returns 1 for tomorrow', () => {
      expect(getDaysUntil('2025-01-16')).toBe(1);
    });
  });

  describe('formatRelativeDate', () => {
    it('returns "today" for today', () => {
      expect(formatRelativeDate('2025-01-15')).toBe('today');
    });

    it('returns "tomorrow" for tomorrow', () => {
      expect(formatRelativeDate('2025-01-16')).toBe('tomorrow');
    });

    it('returns "in X days" for dates within a week', () => {
      expect(formatRelativeDate('2025-01-18')).toBe('in 3 days');
    });

    it('returns "in 1 week" for dates 7-13 days away', () => {
      expect(formatRelativeDate('2025-01-25')).toBe('in 1 week');
    });

    it('returns "yesterday" for yesterday', () => {
      expect(formatRelativeDate('2025-01-14')).toBe('yesterday');
    });

    it('returns "X days ago" for past dates', () => {
      expect(formatRelativeDate('2025-01-10')).toBe('5 days ago');
    });
  });

  describe('formatShortDate', () => {
    it('formats date as "Mon DD"', () => {
      expect(formatShortDate('2025-01-15')).toBe('Jan 15');
    });

    it('formats different months correctly', () => {
      expect(formatShortDate('2025-12-25')).toBe('Dec 25');
    });
  });

  describe('isPast', () => {
    it('returns true for past dates', () => {
      expect(isPast('2025-01-10')).toBe(true);
    });

    it('returns false for today', () => {
      expect(isPast('2025-01-15')).toBe(false);
    });

    it('returns false for future dates', () => {
      expect(isPast('2025-01-20')).toBe(false);
    });
  });

  describe('isWithinDays', () => {
    it('returns true if date is within specified days', () => {
      expect(isWithinDays('2025-01-18', 7)).toBe(true);
    });

    it('returns false if date is beyond specified days', () => {
      expect(isWithinDays('2025-01-25', 7)).toBe(false);
    });

    it('returns false for past dates', () => {
      expect(isWithinDays('2025-01-10', 7)).toBe(false);
    });

    it('returns true for today with any positive days', () => {
      expect(isWithinDays('2025-01-15', 3)).toBe(true);
    });
  });
});
