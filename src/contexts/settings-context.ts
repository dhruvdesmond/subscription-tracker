import { createContext } from 'react';
import type { UserSettings, CurrencyCode, ThemeMode } from '@/types';

export interface SettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
