import type { Subscription, CreateSubscriptionDTO, UpdateSubscriptionDTO } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SubscriptionForm } from './SubscriptionForm';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription;
  onSave: (data: CreateSubscriptionDTO | UpdateSubscriptionDTO) => Promise<void>;
  isLoading?: boolean;
}

export function SubscriptionModal({
  open,
  onOpenChange,
  subscription,
  onSave,
  isLoading,
}: SubscriptionModalProps) {
  const handleSubmit = async (data: CreateSubscriptionDTO) => {
    if (subscription) {
      await onSave({ ...data, id: subscription.id });
    } else {
      await onSave(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
          <DialogDescription>
            {subscription
              ? 'Update the details of your subscription.'
              : 'Add a new subscription to track.'}
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm
          initialData={subscription}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
