import type { Subscription } from '@/types';
import { subscriptionSchema } from '@/schemas';

interface ExportData {
  version: string;
  exportedAt: string;
  subscriptions: Subscription[];
}

export const exportService = {
  /**
   * Export subscriptions to JSON file
   */
  exportToJSON(subscriptions: Subscription[]): void {
    const data: ExportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subscriptions,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export subscriptions to CSV file
   */
  exportToCSV(subscriptions: Subscription[]): void {
    const headers = ['Name', 'Amount', 'Currency', 'Cycle', 'Category', 'Next Renewal', 'Active'];

    const rows = subscriptions.map(sub => [
      sub.name,
      sub.amount.toString(),
      sub.currency,
      sub.cycle,
      sub.category,
      sub.nextRenewal,
      sub.isActive ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Import subscriptions from JSON file
   */
  async importFromJSON(file: File): Promise<Subscription[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content) as ExportData;

          // Validate file format
          if (!data.version || !data.subscriptions) {
            throw new Error('Invalid export file format');
          }

          // Validate each subscription
          const validatedSubscriptions: Subscription[] = [];

          for (const sub of data.subscriptions) {
            // Validate against schema (basic fields)
            const result = subscriptionSchema.safeParse({
              name: sub.name,
              amount: sub.amount,
              currency: sub.currency,
              cycle: sub.cycle,
              startDate: sub.startDate,
              category: sub.category,
              reminderDays: sub.reminderDays,
              icon: sub.icon,
              color: sub.color,
              notes: sub.notes,
              isActive: sub.isActive,
            });

            if (!result.success) {
              console.warn(`Skipping invalid subscription: ${sub.name}`, result.error);
              continue;
            }

            // Generate new ID to avoid conflicts
            validatedSubscriptions.push({
              ...sub,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          resolve(validatedSubscriptions);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  /**
   * Validate an import file without importing
   */
  async validateImportFile(file: File): Promise<{
    valid: boolean;
    count: number;
    errors: string[];
  }> {
    try {
      const subscriptions = await this.importFromJSON(file);
      return {
        valid: true,
        count: subscriptions.length,
        errors: [],
      };
    } catch (error) {
      return {
        valid: false,
        count: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  },
};
