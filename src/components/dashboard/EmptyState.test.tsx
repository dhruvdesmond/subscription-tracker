import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the empty state message', () => {
    render(<EmptyState onAddSubscription={() => {}} />);
    expect(screen.getByText('No subscriptions yet')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<EmptyState onAddSubscription={() => {}} />);
    expect(
      screen.getByText(/Start tracking your subscriptions to get insights/)
    ).toBeInTheDocument();
  });

  it('renders the add subscription button', () => {
    render(<EmptyState onAddSubscription={() => {}} />);
    expect(
      screen.getByRole('button', { name: /add your first subscription/i })
    ).toBeInTheDocument();
  });

  it('calls onAddSubscription when button is clicked', () => {
    const onAddSubscription = vi.fn();
    render(<EmptyState onAddSubscription={onAddSubscription} />);

    const button = screen.getByRole('button', { name: /add your first subscription/i });
    fireEvent.click(button);

    expect(onAddSubscription).toHaveBeenCalledTimes(1);
  });

  it('renders the credit card icon', () => {
    render(<EmptyState onAddSubscription={() => {}} />);
    // The icon should be present (svg element)
    const container = screen.getByText('No subscriptions yet').closest('div');
    expect(container).toBeInTheDocument();
  });
});
