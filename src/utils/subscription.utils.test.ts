import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Subscription } from '@/types';
import {
  normalizeToMonthly,
  normalizeToYearly,
  calculateMonthlyTotal,
  calculateYearlyTotal,
  getUpcomingRenewals,
  getRenewalUrgency,
  groupByCategory,
  calculateSpendingByCategory,
  sortSubscriptions,
} from './subscription.utils';

const createMockSubscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'test-id',
  name: 'Test Subscription',
  amount: 10,
  currency: 'USD',
  cycle: 'monthly',
  startDate: '2025-01-01',
  nextRenewal: '2025-02-01',
  category: 'entertainment',
  reminderDays: 3,
  icon: '🎬',
  color: '#EF4444',
  notes: '',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

describe('subscription.utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('normalizeToMonthly', () => {
    it('returns same amount for monthly', () => {
      expect(normalizeToMonthly(10, 'monthly')).toBe(10);
    });

    it('converts weekly to monthly (x4.33)', () => {
      expect(normalizeToMonthly(10, 'weekly')).toBeCloseTo(43.3, 1);
    });

    it('converts quarterly to monthly (/3)', () => {
      expect(normalizeToMonthly(30, 'quarterly')).toBe(10);
    });

    it('converts yearly to monthly (/12)', () => {
      expect(normalizeToMonthly(120, 'yearly')).toBe(10);
    });
  });

  describe('normalizeToYearly', () => {
    it('converts monthly to yearly (x12)', () => {
      expect(normalizeToYearly(10, 'monthly')).toBe(120);
    });

    it('converts weekly to yearly (x52)', () => {
      expect(normalizeToYearly(10, 'weekly')).toBe(520);
    });

    it('converts quarterly to yearly (x4)', () => {
      expect(normalizeToYearly(30, 'quarterly')).toBe(120);
    });

    it('returns same amount for yearly', () => {
      expect(normalizeToYearly(120, 'yearly')).toBe(120);
    });
  });

  describe('calculateMonthlyTotal', () => {
    it('sums monthly amounts correctly', () => {
      const subs = [
        createMockSubscription({ amount: 10, cycle: 'monthly' }),
        createMockSubscription({ amount: 20, cycle: 'monthly' }),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(30);
    });

    it('normalizes different cycles', () => {
      const subs = [
        createMockSubscription({ amount: 10, cycle: 'monthly' }),
        createMockSubscription({ amount: 120, cycle: 'yearly' }),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(20);
    });

    it('excludes inactive subscriptions', () => {
      const subs = [
        createMockSubscription({ amount: 10, isActive: true }),
        createMockSubscription({ amount: 20, isActive: false }),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(10);
    });

    it('returns 0 for empty array', () => {
      expect(calculateMonthlyTotal([])).toBe(0);
    });
  });

  describe('calculateYearlyTotal', () => {
    it('calculates yearly total correctly', () => {
      const subs = [
        createMockSubscription({ amount: 10, cycle: 'monthly' }),
        createMockSubscription({ amount: 120, cycle: 'yearly' }),
      ];
      expect(calculateYearlyTotal(subs)).toBe(240);
    });
  });

  describe('getUpcomingRenewals', () => {
    it('returns subscriptions within specified days', () => {
      const subs = [
        createMockSubscription({ id: '1', nextRenewal: '2025-01-18' }),
        createMockSubscription({ id: '2', nextRenewal: '2025-01-25' }),
        createMockSubscription({ id: '3', nextRenewal: '2025-02-15' }),
      ];

      const result = getUpcomingRenewals(subs, 7);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('excludes inactive subscriptions', () => {
      const subs = [
        createMockSubscription({ id: '1', nextRenewal: '2025-01-18', isActive: true }),
        createMockSubscription({ id: '2', nextRenewal: '2025-01-18', isActive: false }),
      ];

      const result = getUpcomingRenewals(subs, 7);
      expect(result).toHaveLength(1);
    });

    it('sorts by renewal date ascending', () => {
      const subs = [
        createMockSubscription({ id: '1', nextRenewal: '2025-01-20' }),
        createMockSubscription({ id: '2', nextRenewal: '2025-01-17' }),
        createMockSubscription({ id: '3', nextRenewal: '2025-01-18' }),
      ];

      const result = getUpcomingRenewals(subs, 7);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });
  });

  describe('getRenewalUrgency', () => {
    it('returns "urgent" for overdue', () => {
      expect(getRenewalUrgency('2025-01-10')).toBe('urgent');
    });

    it('returns "urgent" for 0-3 days', () => {
      expect(getRenewalUrgency('2025-01-15')).toBe('urgent');
      expect(getRenewalUrgency('2025-01-18')).toBe('urgent');
    });

    it('returns "soon" for 4-7 days', () => {
      expect(getRenewalUrgency('2025-01-19')).toBe('soon');
      expect(getRenewalUrgency('2025-01-22')).toBe('soon');
    });

    it('returns "safe" for 8+ days', () => {
      expect(getRenewalUrgency('2025-01-25')).toBe('safe');
    });
  });

  describe('groupByCategory', () => {
    it('groups subscriptions by category', () => {
      const subs = [
        createMockSubscription({ id: '1', category: 'entertainment' }),
        createMockSubscription({ id: '2', category: 'productivity' }),
        createMockSubscription({ id: '3', category: 'entertainment' }),
      ];

      const result = groupByCategory(subs);
      expect(result.entertainment).toHaveLength(2);
      expect(result.productivity).toHaveLength(1);
    });
  });

  describe('calculateSpendingByCategory', () => {
    it('calculates spending per category', () => {
      const subs = [
        createMockSubscription({ amount: 10, category: 'entertainment' }),
        createMockSubscription({ amount: 20, category: 'entertainment' }),
        createMockSubscription({ amount: 15, category: 'productivity' }),
      ];

      const result = calculateSpendingByCategory(subs);
      expect(result.entertainment).toBe(30);
      expect(result.productivity).toBe(15);
    });

    it('excludes inactive subscriptions', () => {
      const subs = [
        createMockSubscription({ amount: 10, category: 'entertainment', isActive: true }),
        createMockSubscription({ amount: 20, category: 'entertainment', isActive: false }),
      ];

      const result = calculateSpendingByCategory(subs);
      expect(result.entertainment).toBe(10);
    });
  });

  describe('sortSubscriptions', () => {
    it('sorts by name ascending', () => {
      const subs = [
        createMockSubscription({ name: 'Zoom' }),
        createMockSubscription({ name: 'Apple' }),
        createMockSubscription({ name: 'Netflix' }),
      ];

      const result = sortSubscriptions(subs, 'name', 'asc');
      expect(result[0].name).toBe('Apple');
      expect(result[1].name).toBe('Netflix');
      expect(result[2].name).toBe('Zoom');
    });

    it('sorts by amount descending', () => {
      const subs = [
        createMockSubscription({ amount: 10 }),
        createMockSubscription({ amount: 30 }),
        createMockSubscription({ amount: 20 }),
      ];

      const result = sortSubscriptions(subs, 'amount', 'desc');
      expect(result[0].amount).toBe(30);
      expect(result[1].amount).toBe(20);
      expect(result[2].amount).toBe(10);
    });

    it('sorts by nextRenewal ascending', () => {
      const subs = [
        createMockSubscription({ nextRenewal: '2025-03-01' }),
        createMockSubscription({ nextRenewal: '2025-01-20' }),
        createMockSubscription({ nextRenewal: '2025-02-15' }),
      ];

      const result = sortSubscriptions(subs, 'nextRenewal', 'asc');
      expect(result[0].nextRenewal).toBe('2025-01-20');
      expect(result[1].nextRenewal).toBe('2025-02-15');
      expect(result[2].nextRenewal).toBe('2025-03-01');
    });
  });
});
