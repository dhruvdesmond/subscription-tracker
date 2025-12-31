import type { Subscription } from '@/types';
import { formatCurrency } from '@/constants';
import { formatShortDate } from '@/utils';

export const notificationService = {
  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  },

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  },

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  /**
   * Show a notification
   */
  async show(title: string, options?: NotificationOptions): Promise<void> {
    if (this.getPermission() !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Use service worker if available, otherwise regular notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    } else {
      new Notification(title, options);
    }
  },

  /**
   * Show a renewal reminder notification
   */
  async showRenewalReminder(subscription: Subscription): Promise<void> {
    const formattedAmount = formatCurrency(subscription.amount, subscription.currency);
    const formattedDate = formatShortDate(subscription.nextRenewal);

    await this.show(`${subscription.name} renewal coming up`, {
      body: `${formattedAmount} due on ${formattedDate}`,
      tag: `renewal-${subscription.id}`,
      requireInteraction: true,
      data: {
        subscriptionId: subscription.id,
        type: 'renewal-reminder',
      },
    });
  },

  /**
   * Schedule a reminder for a subscription
   * Note: In a real app, this would use service worker and scheduled notifications
   * For now, we'll store the schedule and check periodically
   */
  scheduleReminder(subscription: Subscription, daysBeforeRenewal: number): void {
    const renewalDate = new Date(subscription.nextRenewal);
    const reminderDate = new Date(renewalDate);
    reminderDate.setDate(reminderDate.getDate() - daysBeforeRenewal);

    // Store in localStorage for now (in production, use IndexedDB)
    const schedules = this.getScheduledReminders();
    schedules[subscription.id] = {
      subscriptionId: subscription.id,
      reminderDate: reminderDate.toISOString(),
      sent: false,
    };
    localStorage.setItem('scheduled-reminders', JSON.stringify(schedules));
  },

  /**
   * Get all scheduled reminders
   */
  getScheduledReminders(): Record<
    string,
    { subscriptionId: string; reminderDate: string; sent: boolean }
  > {
    const stored = localStorage.getItem('scheduled-reminders');
    return stored ? JSON.parse(stored) : {};
  },

  /**
   * Check and send due reminders
   */
  async checkDueReminders(
    getSubscription: (id: string) => Promise<Subscription | undefined>
  ): Promise<void> {
    const schedules = this.getScheduledReminders();
    const now = new Date();

    for (const [id, schedule] of Object.entries(schedules)) {
      if (schedule.sent) continue;

      const reminderDate = new Date(schedule.reminderDate);
      if (reminderDate <= now) {
        const subscription = await getSubscription(id);
        if (subscription && subscription.isActive) {
          await this.showRenewalReminder(subscription);
          schedules[id].sent = true;
        }
      }
    }

    localStorage.setItem('scheduled-reminders', JSON.stringify(schedules));
  },

  /**
   * Clear reminder for a subscription
   */
  clearReminder(subscriptionId: string): void {
    const schedules = this.getScheduledReminders();
    delete schedules[subscriptionId];
    localStorage.setItem('scheduled-reminders', JSON.stringify(schedules));
  },
};
