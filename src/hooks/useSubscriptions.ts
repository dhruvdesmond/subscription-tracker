import { useContext } from 'react';
import { SubscriptionContext } from '@/contexts';

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }

  return context;
}
