import type { Subscription, BillingCycle } from '@/types';
import { getDaysUntil } from './date.utils';

/**
 * Normalize subscription amount to monthly equivalent
 */
export function normalizeToMonthly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return amount * 4.33; // Average weeks per month
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'yearly':
      return amount / 12;
  }
}

/**
 * Normalize subscription amount to yearly equivalent
 */
export function normalizeToYearly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'weekly':
      return amount * 52;
    case 'monthly':
      return amount * 12;
    case 'quarterly':
      return amount * 4;
    case 'yearly':
      return amount;
  }
}

/**
 * Calculate total monthly spend from subscriptions
 */
export function calculateMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.isActive)
    .reduce((total, sub) => total + normalizeToMonthly(sub.amount, sub.cycle), 0);
}

/**
 * Calculate total yearly spend from subscriptions
 */
export function calculateYearlyTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(s => s.isActive)
    .reduce((total, sub) => total + normalizeToYearly(sub.amount, sub.cycle), 0);
}

/**
 * Get subscriptions with upcoming renewals within N days
 */
export function getUpcomingRenewals(subscriptions: Subscription[], days: number): Subscription[] {
  return subscriptions
    .filter(s => {
      if (!s.isActive) return false;
      const daysUntil = getDaysUntil(s.nextRenewal);
      return daysUntil >= 0 && daysUntil <= days;
    })
    .sort((a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime());
}

/**
 * Get renewal urgency level based on days until renewal
 */
export function getRenewalUrgency(dateString: string): 'urgent' | 'soon' | 'safe' {
  const days = getDaysUntil(dateString);

  if (days < 0) return 'urgent'; // Overdue
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'soon';
  return 'safe';
}

/**
 * Group subscriptions by category
 */
export function groupByCategory(subscriptions: Subscription[]): Record<string, Subscription[]> {
  return subscriptions.reduce(
    (acc, sub) => {
      const category = sub.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(sub);
      return acc;
    },
    {} as Record<string, Subscription[]>
  );
}

/**
 * Calculate spending by category
 */
export function calculateSpendingByCategory(subscriptions: Subscription[]): Record<string, number> {
  const grouped = groupByCategory(subscriptions.filter(s => s.isActive));

  return Object.entries(grouped).reduce(
    (acc, [category, subs]) => {
      acc[category] = subs.reduce(
        (total, sub) => total + normalizeToMonthly(sub.amount, sub.cycle),
        0
      );
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Category breakdown item
 */
export interface CategoryBreakdownItem {
  category: string;
  total: number;
  count: number;
}

/**
 * Get category breakdown with totals
 */
export function getCategoryBreakdown(subscriptions: Subscription[]): CategoryBreakdownItem[] {
  const grouped = groupByCategory(subscriptions.filter(s => s.isActive));

  return Object.entries(grouped)
    .map(([category, subs]) => ({
      category,
      total: subs.reduce((sum, sub) => sum + normalizeToMonthly(sub.amount, sub.cycle), 0),
      count: subs.length,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Sort subscriptions by field
 */
export function sortSubscriptions(
  subscriptions: Subscription[],
  field: 'name' | 'amount' | 'nextRenewal' | 'createdAt',
  order: 'asc' | 'desc' = 'asc'
): Subscription[] {
  const sorted = [...subscriptions].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'nextRenewal':
        comparison = new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime();
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}
