import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Subscription, CreateSubscriptionDTO } from '@/types';
import { subscriptionSchema, type SubscriptionFormData } from '@/schemas';
import { CATEGORIES, CURRENCIES } from '@/constants';
import { getToday } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface SubscriptionFormProps {
  initialData?: Subscription;
  onSubmit: (data: CreateSubscriptionDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'Day of renewal' },
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '1 week before' },
];

const ICONS = ['📺', '🎵', '☁️', '💼', '🎮', '📚', '🏋️', '🛒', '💳', '📱'];
const COLORS = [
  '#EF4444',
  '#F59E0B',
  '#22C55E',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#6366F1',
];

export function SubscriptionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: SubscriptionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      amount: initialData?.amount ?? 0,
      currency: initialData?.currency ?? 'USD',
      cycle: initialData?.cycle ?? 'monthly',
      startDate: initialData?.startDate ?? getToday(),
      category: initialData?.category ?? 'other',
      reminderDays: initialData?.reminderDays ?? 3,
      icon: initialData?.icon ?? '📦',
      color: initialData?.color ?? '#6366F1',
      notes: initialData?.notes ?? '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');
  const selectedCycle = watch('cycle');
  const selectedCategory = watch('category');
  const selectedCurrency = watch('currency');
  const reminderDays = watch('reminderDays');

  const handleFormSubmit = async (data: SubscriptionFormData) => {
    await onSubmit(data as CreateSubscriptionDTO);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Netflix, Spotify..." {...register('name')} />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>

      {/* Amount & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="9.99"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && <p className="text-destructive text-sm">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={selectedCurrency} onValueChange={v => setValue('currency', v as never)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Billing Cycle & Start Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Billing Cycle</Label>
          <Select value={selectedCycle} onValueChange={v => setValue('cycle', v as never)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CYCLES.map(c => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
          {errors.startDate && (
            <p className="text-destructive text-sm">{errors.startDate.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={selectedCategory} onValueChange={v => setValue('category', v as never)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>
                {c.icon} {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Icon & Color */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setValue('icon', icon)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors ${
                  selectedIcon === icon ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`h-8 w-8 rounded-full transition-transform ${
                  selectedColor === color ? 'ring-primary scale-110 ring-2 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="space-y-2">
        <Label>Remind me</Label>
        <Select
          value={String(reminderDays)}
          onValueChange={v => setValue('reminderDays', Number(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REMINDER_OPTIONS.map(r => (
              <SelectItem key={r.value} value={String(r.value)}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input id="notes" placeholder="Any additional notes..." {...register('notes')} />
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Active subscription</Label>
        <Switch
          id="isActive"
          checked={watch('isActive')}
          onCheckedChange={v => setValue('isActive', v)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Add Subscription'}
        </Button>
      </div>
    </form>
  );
}
