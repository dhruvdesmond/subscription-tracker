import { createContext } from 'react';
import type {
  Subscription,
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  FilterConfig,
  SortConfig,
} from '@/types';

export interface SubscriptionState {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: Error | null;
}

export type SubscriptionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBSCRIPTIONS'; payload: Subscription[] }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'SET_ERROR'; payload: Error };

export interface SubscriptionContextValue extends SubscriptionState {
  addSubscription: (dto: CreateSubscriptionDTO) => Promise<Subscription>;
  updateSubscription: (dto: UpdateSubscriptionDTO) => Promise<Subscription>;
  deleteSubscription: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<Subscription>;
  refresh: (filter?: FilterConfig, sort?: SortConfig) => Promise<void>;
  getMonthlyTotal: () => number;
  getYearlyTotal: () => number;
  getUpcoming: (days?: number) => Subscription[];
}

export const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);
