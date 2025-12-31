import { z } from 'zod';

export const billingCycleSchema = z.enum(['weekly', 'monthly', 'quarterly', 'yearly']);

export const categorySchema = z.enum([
  'entertainment',
  'productivity',
  'utilities',
  'health',
  'education',
  'finance',
  'shopping',
  'other',
]);

export const currencyCodeSchema = z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']);

export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  amount: z.number().positive('Amount must be positive').max(999999.99, 'Amount too large'),
  currency: currencyCodeSchema,
  cycle: billingCycleSchema,
  startDate: z.string().min(1, 'Start date is required'),
  category: categorySchema,
  reminderDays: z.number().int().min(0).max(30),
  icon: z.string().max(10),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  notes: z.string().max(500),
  isActive: z.boolean(),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
