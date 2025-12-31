import { useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type {
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  FilterConfig,
  SortConfig,
} from '@/types';
import { subscriptionService } from '@/services';
import {
  SubscriptionContext,
  type SubscriptionState,
  type SubscriptionAction,
  type SubscriptionContextValue,
} from './subscription-context';

const initialState: SubscriptionState = {
  subscriptions: [],
  isLoading: true,
  error: null,
};

function subscriptionReducer(
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload, isLoading: false, error: null };
    case 'ADD_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: [...state.subscriptions, action.payload],
      };
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.filter(s => s.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);

  const refresh = useCallback(async (filter?: FilterConfig, sort?: SortConfig) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const subscriptions = await subscriptionService.getAll(filter, sort);
      dispatch({ type: 'SET_SUBSCRIPTIONS', payload: subscriptions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  }, []);

  const addSubscription = useCallback(async (dto: CreateSubscriptionDTO) => {
    const subscription = await subscriptionService.create(dto);
    dispatch({ type: 'ADD_SUBSCRIPTION', payload: subscription });
    return subscription;
  }, []);

  const updateSubscription = useCallback(async (dto: UpdateSubscriptionDTO) => {
    const subscription = await subscriptionService.update(dto);
    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: subscription });
    return subscription;
  }, []);

  const deleteSubscription = useCallback(async (id: string) => {
    await subscriptionService.delete(id);
    dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id });
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    const subscription = await subscriptionService.toggleActive(id);
    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: subscription });
    return subscription;
  }, []);

  const getMonthlyTotal = useCallback(() => {
    return state.subscriptions
      .filter(s => s.isActive)
      .reduce((total, sub) => {
        const monthly =
          sub.cycle === 'weekly'
            ? sub.amount * 4.33
            : sub.cycle === 'monthly'
              ? sub.amount
              : sub.cycle === 'quarterly'
                ? sub.amount / 3
                : sub.amount / 12;
        return total + monthly;
      }, 0);
  }, [state.subscriptions]);

  const getYearlyTotal = useCallback(() => {
    return getMonthlyTotal() * 12;
  }, [getMonthlyTotal]);

  const getUpcoming = useCallback(
    (days: number = 7) => {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() + days);

      return state.subscriptions
        .filter(s => {
          if (!s.isActive) return false;
          const renewalDate = new Date(s.nextRenewal);
          return renewalDate >= now && renewalDate <= cutoff;
        })
        .sort((a, b) => new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime());
    },
    [state.subscriptions]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: SubscriptionContextValue = {
    ...state,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
    refresh,
    getMonthlyTotal,
    getYearlyTotal,
    getUpcoming,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}
