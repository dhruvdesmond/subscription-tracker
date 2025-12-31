import type { Subscription, CurrencyCode, Category } from '@/types';
import { getCategoryBreakdown } from '@/utils';
import { getCategoryInfo, formatCurrency } from '@/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryBreakdownProps {
  subscriptions: Subscription[];
  currency?: CurrencyCode;
}

export function CategoryBreakdown({ subscriptions, currency = 'USD' }: CategoryBreakdownProps) {
  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const breakdown = getCategoryBreakdown(activeSubscriptions);

  if (breakdown.length === 0) {
    return null;
  }

  // Calculate total for percentage
  const total = breakdown.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {breakdown.map(item => {
          const categoryInfo = getCategoryInfo(item.category as Category);
          const percentage = total > 0 ? (item.total / total) * 100 : 0;

          return (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{categoryInfo.icon}</span>
                  <span className="font-medium">{categoryInfo.label}</span>
                  <span className="text-muted-foreground">({item.count})</span>
                </div>
                <span className="font-semibold">{formatCurrency(item.total, currency)}/mo</span>
              </div>
              <div className="bg-secondary h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: categoryInfo.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
