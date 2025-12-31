import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Subscription, CreateSubscriptionDTO } from '@/types';
import { subscriptionService } from './subscription.service';
import { subscriptionRepository } from '@/repositories';

// Mock the repository
vi.mock('@/repositories', () => ({
  subscriptionRepository: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
  },
}));

const mockSubscription: Subscription = {
  id: 'test-id-123',
  name: 'Netflix',
  amount: 15.99,
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
};

describe('subscriptionService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('creates a subscription with generated fields', async () => {
      const dto: CreateSubscriptionDTO = {
        name: 'Netflix',
        amount: 15.99,
        currency: 'USD',
        cycle: 'monthly',
        startDate: '2025-01-01',
        category: 'entertainment',
        reminderDays: 3,
        icon: '🎬',
        color: '#EF4444',
        notes: '',
        isActive: true,
      };

      vi.mocked(subscriptionRepository.create).mockResolvedValue(undefined);

      const result = await subscriptionService.create(dto);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Netflix');
      expect(result.nextRenewal).toBe('2025-02-01');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(subscriptionRepository.create).toHaveBeenCalledWith(result);
    });

    it('calculates next renewal date correctly', async () => {
      const dto: CreateSubscriptionDTO = {
        name: 'Test',
        amount: 10,
        currency: 'USD',
        cycle: 'yearly',
        startDate: '2024-06-01',
        category: 'other',
        reminderDays: 3,
        icon: '📦',
        color: '#000000',
        notes: '',
        isActive: true,
      };

      vi.mocked(subscriptionRepository.create).mockResolvedValue(undefined);

      const result = await subscriptionService.create(dto);

      // Next yearly renewal after Jan 15, 2025 would be June 1, 2025
      expect(result.nextRenewal).toBe('2025-06-01');
    });
  });

  describe('update', () => {
    it('updates an existing subscription', async () => {
      vi.mocked(subscriptionRepository.findById).mockResolvedValue(mockSubscription);
      vi.mocked(subscriptionRepository.update).mockResolvedValue(undefined);

      const result = await subscriptionService.update({
        id: 'test-id-123',
        amount: 19.99,
      });

      expect(result.amount).toBe(19.99);
      expect(result.name).toBe('Netflix');
      expect(result.updatedAt).not.toBe(mockSubscription.updatedAt);
    });

    it('throws error if subscription not found', async () => {
      vi.mocked(subscriptionRepository.findById).mockResolvedValue(undefined);

      await expect(subscriptionService.update({ id: 'nonexistent', amount: 10 })).rejects.toThrow(
        'Subscription not found'
      );
    });

    it('recalculates next renewal when start date changes', async () => {
      vi.mocked(subscriptionRepository.findById).mockResolvedValue(mockSubscription);
      vi.mocked(subscriptionRepository.update).mockResolvedValue(undefined);

      const result = await subscriptionService.update({
        id: 'test-id-123',
        startDate: '2025-01-10',
      });

      expect(result.nextRenewal).toBe('2025-02-10');
    });

    it('recalculates next renewal when cycle changes', async () => {
      vi.mocked(subscriptionRepository.findById).mockResolvedValue(mockSubscription);
      vi.mocked(subscriptionRepository.update).mockResolvedValue(undefined);

      const result = await subscriptionService.update({
        id: 'test-id-123',
        cycle: 'yearly',
      });

      expect(result.nextRenewal).toBe('2026-01-01');
    });
  });

  describe('delete', () => {
    it('deletes a subscription', async () => {
      vi.mocked(subscriptionRepository.delete).mockResolvedValue(undefined);

      await subscriptionService.delete('test-id-123');

      expect(subscriptionRepository.delete).toHaveBeenCalledWith('test-id-123');
    });
  });

  describe('getAll', () => {
    it('returns all subscriptions', async () => {
      vi.mocked(subscriptionRepository.findAll).mockResolvedValue([mockSubscription]);

      const result = await subscriptionService.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Netflix');
    });

    it('applies category filter', async () => {
      const subs = [
        { ...mockSubscription, id: '1', category: 'entertainment' as const },
        { ...mockSubscription, id: '2', category: 'productivity' as const },
      ];
      vi.mocked(subscriptionRepository.findAll).mockResolvedValue(subs);

      const result = await subscriptionService.getAll({
        categories: ['entertainment'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('entertainment');
    });

    it('applies isActive filter', async () => {
      const subs = [
        { ...mockSubscription, id: '1', isActive: true },
        { ...mockSubscription, id: '2', isActive: false },
      ];
      vi.mocked(subscriptionRepository.findAll).mockResolvedValue(subs);

      const result = await subscriptionService.getAll({ isActive: true });

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it('applies amount filters', async () => {
      const subs = [
        { ...mockSubscription, id: '1', amount: 5 },
        { ...mockSubscription, id: '2', amount: 15 },
        { ...mockSubscription, id: '3', amount: 25 },
      ];
      vi.mocked(subscriptionRepository.findAll).mockResolvedValue(subs);

      const result = await subscriptionService.getAll({
        minAmount: 10,
        maxAmount: 20,
      });

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(15);
    });

    it('applies sorting', async () => {
      const subs = [
        { ...mockSubscription, id: '1', name: 'Zoom' },
        { ...mockSubscription, id: '2', name: 'Apple' },
      ];
      vi.mocked(subscriptionRepository.findAll).mockResolvedValue(subs);

      const result = await subscriptionService.getAll(undefined, {
        field: 'name',
        order: 'asc',
      });

      expect(result[0].name).toBe('Apple');
      expect(result[1].name).toBe('Zoom');
    });
  });

  describe('toggleActive', () => {
    it('toggles active status from true to false', async () => {
      vi.mocked(subscriptionRepository.findById).mockResolvedValue({
        ...mockSubscription,
        isActive: true,
      });
      vi.mocked(subscriptionRepository.update).mockResolvedValue(undefined);

      const result = await subscriptionService.toggleActive('test-id-123');

      expect(result.isActive).toBe(false);
    });

    it('toggles active status from false to true', async () => {
      vi.mocked(subscriptionRepository.findById).mockResolvedValue({
        ...mockSubscription,
        isActive: false,
      });
      vi.mocked(subscriptionRepository.update).mockResolvedValue(undefined);

      const result = await subscriptionService.toggleActive('test-id-123');

      expect(result.isActive).toBe(true);
    });
  });

  describe('getMonthlyTotal', () => {
    it('calculates monthly total correctly', async () => {
      const subs = [
        { ...mockSubscription, amount: 10, cycle: 'monthly' as const },
        { ...mockSubscription, amount: 120, cycle: 'yearly' as const },
      ];
      vi.mocked(subscriptionRepository.findAll).mockResolvedValue(subs);

      const result = await subscriptionService.getMonthlyTotal();

      expect(result).toBe(20); // 10 + (120/12)
    });
  });

  describe('getUpcoming', () => {
    it('returns upcoming renewals within specified days', async () => {
      const subs = [
        { ...mockSubscription, id: '1', nextRenewal: '2025-01-18' },
        { ...mockSubscription, id: '2', nextRenewal: '2025-02-01' },
      ];
      vi.mocked(subscriptionRepository.findAll).mockResolvedValue(subs);

      const result = await subscriptionService.getUpcoming(7);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});
