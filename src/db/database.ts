import Dexie, { type EntityTable } from 'dexie';
import type { Subscription, UserSettings } from '@/types';

export class SubscriptionTrackerDB extends Dexie {
  subscriptions!: EntityTable<Subscription, 'id'>;
  settings!: EntityTable<UserSettings, 'id'>;

  constructor() {
    super('SubscriptionTrackerDB');

    this.version(1).stores({
      subscriptions: 'id, name, category, nextRenewal, isActive, createdAt',
      settings: 'id',
    });
  }
}

export const db = new SubscriptionTrackerDB();
