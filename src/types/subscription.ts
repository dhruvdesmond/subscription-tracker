export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type Category =
  | 'entertainment'
  | 'productivity'
  | 'utilities'
  | 'health'
  | 'education'
  | 'finance'
  | 'shopping'
  | 'other';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  cycle: BillingCycle;
  startDate: string; // ISO 8601
  nextRenewal: string; // ISO 8601
  category: Category;
  reminderDays: number;
  icon: string;
  color: string;
  notes: string;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type CreateSubscriptionDTO = Omit<
  Subscription,
  'id' | 'createdAt' | 'updatedAt' | 'nextRenewal'
>;

export type UpdateSubscriptionDTO = Partial<CreateSubscriptionDTO> & {
  id: string;
};

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';
