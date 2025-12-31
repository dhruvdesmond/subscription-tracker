import { db } from '@/db';
import type { UserSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

const SETTINGS_ID = 'user-settings';

export const settingsRepository = {
  async get(): Promise<UserSettings> {
    const settings = await db.settings.get(SETTINGS_ID);
    if (!settings) {
      await db.settings.add(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return settings;
  },

  async update(settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.get();
    const updated: UserSettings = {
      ...current,
      ...settings,
      id: SETTINGS_ID,
      updatedAt: new Date().toISOString(),
    };
    await db.settings.put(updated);
    return updated;
  },

  async reset(): Promise<UserSettings> {
    const resetSettings = {
      ...DEFAULT_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.settings.put(resetSettings);
    return resetSettings;
  },
};
