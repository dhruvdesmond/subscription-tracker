import { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserSettings, CurrencyCode, ThemeMode } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { settingsRepository } from '@/repositories';
import { SettingsContext, type SettingsContextValue } from './settings-context';

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loaded = await settingsRepository.get();
        setSettings(loaded);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const updated = await settingsRepository.update(updates);
    setSettings(updated);
  }, []);

  const resetSettings = useCallback(async () => {
    const reset = await settingsRepository.reset();
    setSettings(reset);
  }, []);

  const setCurrency = useCallback(
    async (currency: CurrencyCode) => {
      await updateSettings({ currency });
    },
    [updateSettings]
  );

  const setTheme = useCallback(
    async (theme: ThemeMode) => {
      await updateSettings({ theme });
    },
    [updateSettings]
  );

  const setNotificationsEnabled = useCallback(
    async (enabled: boolean) => {
      await updateSettings({ notificationsEnabled: enabled });
    },
    [updateSettings]
  );

  const value: SettingsContextValue = {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    setCurrency,
    setTheme,
    setNotificationsEnabled,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
