import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionCard } from './SubscriptionCard';
import type { Subscription } from '@/types';

const mockSubscription: Subscription = {
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
  notes: 'Family plan',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('SubscriptionCard', () => {
  it('renders subscription name', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);
    expect(screen.getByTestId('subscription-name')).toHaveTextContent('Netflix');
  });

  it('renders subscription amount with currency', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);
    expect(screen.getByText('$15.99')).toBeInTheDocument();
  });

  it('renders subscription cycle', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);
    expect(screen.getByText('monthly')).toBeInTheDocument();
  });

  it('renders subscription icon', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);
    expect(screen.getByText('📺')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('shows paused badge when subscription is inactive', () => {
    const inactiveSubscription = { ...mockSubscription, isActive: false };
    render(<SubscriptionCard subscription={inactiveSubscription} />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('applies line-through style when subscription is inactive', () => {
    const inactiveSubscription = { ...mockSubscription, isActive: false };
    render(<SubscriptionCard subscription={inactiveSubscription} />);
    const nameElement = screen.getByTestId('subscription-name');
    expect(nameElement).toHaveClass('line-through');
  });

  it('does not show paused badge when subscription is active', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);
    expect(screen.queryByText('Paused')).not.toBeInTheDocument();
  });

  it('renders dropdown menu trigger button', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('accepts callback props without errors', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onToggleActive = vi.fn();

    // Should render without throwing
    expect(() => {
      render(
        <SubscriptionCard
          subscription={mockSubscription}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      );
    }).not.toThrow();
  });

  it('applies reduced opacity when subscription is inactive', () => {
    const inactiveSubscription = { ...mockSubscription, isActive: false };
    render(<SubscriptionCard subscription={inactiveSubscription} />);
    const card = screen.getByTestId('subscription-card');
    expect(card).toHaveClass('opacity-60');
  });
});
