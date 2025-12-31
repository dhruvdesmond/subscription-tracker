import { db } from '@/db';
import type { Subscription, Category } from '@/types';

export const subscriptionRepository = {
  async create(subscription: Subscription): Promise<void> {
    await db.subscriptions.add(subscription);
  },

  async update(subscription: Subscription): Promise<void> {
    await db.subscriptions.put(subscription);
  },

  async delete(id: string): Promise<void> {
    await db.subscriptions.delete(id);
  },

  async findById(id: string): Promise<Subscription | undefined> {
    return db.subscriptions.get(id);
  },

  async findAll(): Promise<Subscription[]> {
    return db.subscriptions.toArray();
  },

  async findByCategory(category: Category): Promise<Subscription[]> {
    return db.subscriptions.where('category').equals(category).toArray();
  },

  async findActive(): Promise<Subscription[]> {
    return db.subscriptions.where('isActive').equals(1).toArray();
  },

  async count(): Promise<number> {
    return db.subscriptions.count();
  },

  async clear(): Promise<void> {
    await db.subscriptions.clear();
  },
};
