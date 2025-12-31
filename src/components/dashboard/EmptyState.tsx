import { Plus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  onAddSubscription: () => void;
}

export function EmptyState({ onAddSubscription }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <CreditCard className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No subscriptions yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          Start tracking your subscriptions to get insights on your recurring expenses and never
          miss a renewal.
        </p>
        <Button onClick={onAddSubscription}>
          <Plus className="mr-2 h-4 w-4" />
          Add your first subscription
        </Button>
      </CardContent>
    </Card>
  );
}
