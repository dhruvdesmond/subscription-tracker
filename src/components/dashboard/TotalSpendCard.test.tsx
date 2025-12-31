import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalSpendCard } from './TotalSpendCard';
import type { Subscription } from '@/types';

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    cycle: 'monthly',
    startDate: '2024-01-01',
    nextRenewal: '2025-02-01',
    category: 'entertainment',
    reminderDays: 3,
    icon: '📺',
    color: '#E50914',
    notes: '',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Spotify',
    amount: 9.99,
    currency: 'USD',
    cycle: 'monthly',
    startDate: '2024-01-01',
    nextRenewal: '2025-02-01',
    category: 'entertainment',
    reminderDays: 3,
    icon: '🎵',
    color: '#1DB954',
    notes: '',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Paused Service',
    amount: 20.0,
    currency: 'USD',
    cycle: 'monthly',
    startDate: '2024-01-01',
    nextRenewal: '2025-02-01',
    category: 'productivity',
    reminderDays: 3,
    icon: '💼',
    color: '#000000',
    notes: '',
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('TotalSpendCard', () => {
  it('renders monthly spend section', () => {
    render(<TotalSpendCard subscriptions={mockSubscriptions} />);
    expect(screen.getByText('Monthly Spend')).toBeInTheDocument();
  });

  it('renders yearly spend section', () => {
    render(<TotalSpendCard subscriptions={mockSubscriptions} />);
    expect(screen.getByText('Yearly Spend')).toBeInTheDocument();
  });

  it('calculates monthly total from active subscriptions only', () => {
    render(<TotalSpendCard subscriptions={mockSubscriptions} />);
    // 15.99 + 9.99 = 25.98 (paused subscription not included)
    expect(screen.getByText('$25.98')).toBeInTheDocument();
  });

  it('calculates yearly total from active subscriptions only', () => {
    render(<TotalSpendCard subscriptions={mockSubscriptions} />);
    // 25.98 * 12 = 311.76
    expect(screen.getByText('$311.76')).toBeInTheDocument();
  });

  it('shows correct active subscription count', () => {
    render(<TotalSpendCard subscriptions={mockSubscriptions} />);
    expect(screen.getByText('From 2 active subscriptions')).toBeInTheDocument();
  });

  it('shows correct paused subscription count', () => {
    render(<TotalSpendCard subscriptions={mockSubscriptions} />);
    // Find the paused count - it's in a different card
    const pausedCards = screen.getAllByText('1');
    expect(pausedCards.length).toBeGreaterThan(0);
  });

  it('renders with empty subscriptions array', () => {
    render(<TotalSpendCard subscriptions={[]} />);
    // Both monthly and yearly show $0.00
    const zeroAmounts = screen.getAllByText('$0.00');
    expect(zeroAmounts).toHaveLength(2);
    expect(screen.getByText('From 0 active subscriptions')).toBeInTheDocument();
  });

  it('uses provided currency', () => {
    const euroSubscriptions: Subscription[] = [
      {
        ...mockSubscriptions[0],
        currency: 'EUR',
      },
    ];
    render(<TotalSpendCard subscriptions={euroSubscriptions} currency="EUR" />);
    // Should format with euro symbol
    expect(screen.getByText(/15.99/)).toBeInTheDocument();
  });
});
