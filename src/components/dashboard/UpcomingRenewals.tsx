import { Calendar, AlertCircle } from 'lucide-react';
import type { Subscription } from '@/types';
import { getUpcomingRenewals } from '@/utils';
import { formatCurrency } from '@/constants';
import { formatRelativeDate, getDaysUntil } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  limit?: number;
}

export function UpcomingRenewals({ subscriptions, limit = 5 }: UpcomingRenewalsProps) {
  const upcoming = getUpcomingRenewals(subscriptions, 30).slice(0, limit);
  const overdueCount = subscriptions.filter(
    s => s.isActive && getDaysUntil(s.nextRenewal) < 0
  ).length;

  if (upcoming.length === 0 && overdueCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Upcoming Renewals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No upcoming renewals in the next 30 days</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Upcoming Renewals
          {overdueCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              <AlertCircle className="mr-1 h-3 w-3" />
              {overdueCount} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.map(sub => {
          const daysUntil = getDaysUntil(sub.nextRenewal);
          const isOverdue = daysUntil < 0;
          const isDueToday = daysUntil === 0;
          const isDueSoon = daysUntil > 0 && daysUntil <= 3;

          return (
            <div
              key={sub.id}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3',
                isOverdue && 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950',
                isDueToday &&
                  'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950',
                isDueSoon &&
                  'border-amber-100 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md text-base"
                  style={{ backgroundColor: `${sub.color}20` }}
                >
                  {sub.icon}
                </div>
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p
                    className={cn(
                      'text-xs',
                      isOverdue
                        ? 'text-red-600 dark:text-red-400'
                        : isDueToday
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-muted-foreground'
                    )}
                  >
                    {isOverdue
                      ? 'Overdue'
                      : isDueToday
                        ? 'Due today'
                        : formatRelativeDate(sub.nextRenewal)}
                  </p>
                </div>
              </div>
              <p className="font-semibold">{formatCurrency(sub.amount, sub.currency)}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
