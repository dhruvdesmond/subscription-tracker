import { z } from 'zod';
import { currencyCodeSchema } from './subscription.schema';

export const themeModeSchema = z.enum(['light', 'dark', 'system']);

export const settingsSchema = z.object({
  theme: themeModeSchema,
  currency: currencyCodeSchema,
  defaultReminderDays: z.number().int().min(0).max(30),
  notificationsEnabled: z.boolean(),
  firstDayOfWeek: z.union([z.literal(0), z.literal(1)]),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
