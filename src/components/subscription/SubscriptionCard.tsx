import { MoreVertical, Pause, Play, Pencil, Trash2 } from 'lucide-react';
import type { Subscription } from '@/types';
import { formatCurrency, getCategoryInfo } from '@/constants';
import { formatRelativeDate, getDaysUntil, getRenewalUrgency } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string) => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggleActive,
}: SubscriptionCardProps) {
  const categoryInfo = getCategoryInfo(subscription.category);
  const daysUntil = getDaysUntil(subscription.nextRenewal);
  const urgency = getRenewalUrgency(subscription.nextRenewal);

  const urgencyStyles = {
    urgent: 'border-l-red-500',
    soon: 'border-l-amber-500',
    safe: 'border-l-green-500',
  };

  return (
    <Card
      className={cn(
        'border-l-4 transition-all hover:shadow-md',
        urgencyStyles[urgency],
        !subscription.isActive && 'opacity-60'
      )}
      data-testid="subscription-card"
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
            style={{ backgroundColor: `${subscription.color}20` }}
          >
            {subscription.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3
                className={cn('font-medium', !subscription.isActive && 'line-through')}
                data-testid="subscription-name"
              >
                {subscription.name}
              </h3>
              {!subscription.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Paused
                </Badge>
              )}
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs">
                {categoryInfo.label}
              </Badge>
              <span>•</span>
              <span
                className={cn(
                  urgency === 'urgent' && 'text-red-500',
                  urgency === 'soon' && 'text-amber-500'
                )}
              >
                {daysUntil < 0
                  ? 'Overdue'
                  : daysUntil === 0
                    ? 'Due today'
                    : `Renews ${formatRelativeDate(subscription.nextRenewal)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold">
              {formatCurrency(subscription.amount, subscription.currency)}
            </p>
            <p className="text-muted-foreground text-xs">{subscription.cycle}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(subscription)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive?.(subscription.id)}>
                {subscription.isActive ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(subscription.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
