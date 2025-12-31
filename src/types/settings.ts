import type { CurrencyCode } from './subscription';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  id: string;
  theme: ThemeMode;
  currency: CurrencyCode;
  defaultReminderDays: number;
  notificationsEnabled: boolean;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'user-settings',
  theme: 'system',
  currency: 'USD',
  defaultReminderDays: 3,
  notificationsEnabled: true,
  firstDayOfWeek: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
