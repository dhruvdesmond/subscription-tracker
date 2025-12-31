import type {
  Subscription,
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  FilterConfig,
  SortConfig,
} from '@/types';
import { subscriptionRepository } from '@/repositories';
import { calculateNextRenewal } from '@/utils/date.utils';
import {
  calculateMonthlyTotal,
  calculateYearlyTotal,
  getUpcomingRenewals,
  sortSubscriptions,
} from '@/utils/subscription.utils';

export const subscriptionService = {
  /**
   * Create a new subscription
   */
  async create(dto: CreateSubscriptionDTO): Promise<Subscription> {
    const now = new Date().toISOString();
    const subscription: Subscription = {
      id: crypto.randomUUID(),
      ...dto,
      nextRenewal: calculateNextRenewal(dto.startDate, dto.cycle),
      createdAt: now,
      updatedAt: now,
    };

    await subscriptionRepository.create(subscription);
    return subscription;
  },

  /**
   * Update an existing subscription
   */
  async update(dto: UpdateSubscriptionDTO): Promise<Subscription> {
    const existing = await subscriptionRepository.findById(dto.id);
    if (!existing) {
      throw new Error('Subscription not found');
    }

    const updated: Subscription = {
      ...existing,
      ...dto,
      nextRenewal:
        dto.startDate || dto.cycle
          ? calculateNextRenewal(dto.startDate ?? existing.startDate, dto.cycle ?? existing.cycle)
          : existing.nextRenewal,
      updatedAt: new Date().toISOString(),
    };

    await subscriptionRepository.update(updated);
    return updated;
  },

  /**
   * Delete a subscription
   */
  async delete(id: string): Promise<void> {
    await subscriptionRepository.delete(id);
  },

  /**
   * Get a subscription by ID
   */
  async getById(id: string): Promise<Subscription | undefined> {
    return subscriptionRepository.findById(id);
  },

  /**
   * Get all subscriptions with optional filtering and sorting
   */
  async getAll(filter?: FilterConfig, sort?: SortConfig): Promise<Subscription[]> {
    let subscriptions = await subscriptionRepository.findAll();

    if (filter) {
      subscriptions = this.applyFilters(subscriptions, filter);
    }

    if (sort) {
      subscriptions = sortSubscriptions(subscriptions, sort.field, sort.order);
    }

    return subscriptions;
  },

  /**
   * Get subscriptions with upcoming renewals
   */
  async getUpcoming(days: number = 7): Promise<Subscription[]> {
    const all = await subscriptionRepository.findAll();
    return getUpcomingRenewals(all, days);
  },

  /**
   * Toggle subscription active status
   */
  async toggleActive(id: string): Promise<Subscription> {
    const existing = await subscriptionRepository.findById(id);
    if (!existing) {
      throw new Error('Subscription not found');
    }

    return this.update({ id, isActive: !existing.isActive });
  },

  /**
   * Get monthly total
   */
  async getMonthlyTotal(): Promise<number> {
    const subscriptions = await subscriptionRepository.findAll();
    return calculateMonthlyTotal(subscriptions);
  },

  /**
   * Get yearly total
   */
  async getYearlyTotal(): Promise<number> {
    const subscriptions = await subscriptionRepository.findAll();
    return calculateYearlyTotal(subscriptions);
  },

  /**
   * Get count of active subscriptions
   */
  async getActiveCount(): Promise<number> {
    const subscriptions = await subscriptionRepository.findAll();
    return subscriptions.filter(s => s.isActive).length;
  },

  /**
   * Apply filters to subscriptions
   */
  applyFilters(subscriptions: Subscription[], filter: FilterConfig): Subscription[] {
    return subscriptions.filter(sub => {
      if (filter.categories?.length && !filter.categories.includes(sub.category)) {
        return false;
      }
      if (filter.isActive !== undefined && sub.isActive !== filter.isActive) {
        return false;
      }
      if (filter.minAmount !== undefined && sub.amount < filter.minAmount) {
        return false;
      }
      if (filter.maxAmount !== undefined && sub.amount > filter.maxAmount) {
        return false;
      }
      return true;
    });
  },
};
