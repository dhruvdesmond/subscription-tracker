import type { BillingCycle } from '@/types';

/**
 * Calculate the next renewal date based on start date and billing cycle
 */
export function calculateNextRenewal(startDate: string, cycle: BillingCycle): string {
  const start = new Date(startDate);
  const now = new Date();
  let next = new Date(start);

  // Keep adding cycles until we're in the future
  while (next <= now) {
    next = addCycle(next, cycle);
  }

  return next.toISOString().split('T')[0];
}

/**
 * Add one billing cycle to a date
 */
export function addCycle(date: Date, cycle: BillingCycle): Date {
  const result = new Date(date);

  switch (cycle) {
    case 'weekly':
      result.setDate(result.getDate() + 7);
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + 1);
      break;
    case 'quarterly':
      result.setMonth(result.getMonth() + 3);
      break;
    case 'yearly':
      result.setFullYear(result.getFullYear() + 1);
      break;
  }

  return result;
}

/**
 * Get days until a given date
 */
export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();

  // Reset time to midnight for accurate day calculation
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format a date as relative text (e.g., "in 3 days", "tomorrow", "today")
 */
export function formatRelativeDate(dateString: string): string {
  const days = getDaysUntil(dateString);

  if (days < 0) {
    const absDays = Math.abs(days);
    return absDays === 1 ? 'yesterday' : `${absDays} days ago`;
  }

  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 7) return `in ${days} days`;
  if (days < 14) return 'in 1 week';
  if (days < 30) return `in ${Math.floor(days / 7)} weeks`;
  if (days < 60) return 'in 1 month';

  return `in ${Math.floor(days / 30)} months`;
}

/**
 * Format a date as a short string (e.g., "Jan 15")
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a date as a full string (e.g., "January 15, 2025")
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a date is in the past
 */
export function isPast(dateString: string): boolean {
  return getDaysUntil(dateString) < 0;
}

/**
 * Check if a date is within N days from now
 */
export function isWithinDays(dateString: string, days: number): boolean {
  const daysUntil = getDaysUntil(dateString);
  return daysUntil >= 0 && daysUntil <= days;
}
