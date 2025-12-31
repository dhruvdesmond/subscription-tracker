import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { Subscription, CurrencyCode } from '@/types';
import { calculateMonthlyTotal, calculateYearlyTotal } from '@/utils';
import { formatCurrency } from '@/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TotalSpendCardProps {
  subscriptions: Subscription[];
  currency?: CurrencyCode;
}

export function TotalSpendCard({ subscriptions, currency = 'USD' }: TotalSpendCardProps) {
  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const monthlyTotal = calculateMonthlyTotal(activeSubscriptions);
  const yearlyTotal = calculateYearlyTotal(activeSubscriptions);

  // Calculate percentage of inactive vs total for insights
  const totalCount = subscriptions.length;
  const activeCount = activeSubscriptions.length;
  const pausedCount = totalCount - activeCount;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthlyTotal, currency)}</div>
          <p className="text-muted-foreground text-xs">
            From {activeCount} active subscription{activeCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yearly Spend</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(yearlyTotal, currency)}</div>
          <p className="text-muted-foreground text-xs">Projected annual cost</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <div
            className={cn('h-2 w-2 rounded-full', activeCount > 0 ? 'bg-green-500' : 'bg-muted')}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-muted-foreground text-xs">
            subscription{activeCount !== 1 ? 's' : ''} running
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paused</CardTitle>
          <TrendingDown className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pausedCount}</div>
          <p className="text-muted-foreground text-xs">
            subscription{pausedCount !== 1 ? 's' : ''} on hold
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
