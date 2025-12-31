import { useState, useMemo } from 'react';
import type { Subscription, CreateSubscriptionDTO, UpdateSubscriptionDTO } from '@/types';
import { useSubscriptions, useSettings } from '@/hooks';
import { exportService } from '@/services';
import { Header } from '@/components/layout';
import {
  TotalSpendCard,
  UpcomingRenewals,
  EmptyState,
  CategoryBreakdown,
} from '@/components/dashboard';
import { SubscriptionCard, SubscriptionModal } from '@/components/subscription';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

type SortOption = 'name' | 'amount' | 'nextRenewal';

export function DashboardPage() {
  const {
    subscriptions,
    isLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
  } = useSubscriptions();
  const { settings } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('nextRenewal');
  const [isSaving, setIsSaving] = useState(false);

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        sub => sub.name.toLowerCase().includes(query) || sub.notes?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'amount':
          return b.amount - a.amount;
        case 'nextRenewal':
          return new Date(a.nextRenewal).getTime() - new Date(b.nextRenewal).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [subscriptions, searchQuery, sortBy]);

  const handleAddClick = () => {
    setEditingSubscription(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateSubscriptionDTO | UpdateSubscriptionDTO) => {
    setIsSaving(true);
    try {
      if ('id' in data && data.id) {
        await updateSubscription(data as UpdateSubscriptionDTO);
      } else {
        await addSubscription(data as CreateSubscriptionDTO);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      await deleteSubscription(id);
    }
  };

  const handleToggleActive = async (id: string) => {
    await toggleActive(id);
  };

  const handleExport = () => {
    exportService.exportToJSON(subscriptions);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header onAddSubscription={handleAddClick} onExport={handleExport} />

      <main className="container px-4 py-6">
        {subscriptions.length === 0 ? (
          <EmptyState onAddSubscription={handleAddClick} />
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <TotalSpendCard subscriptions={subscriptions} currency={settings.currency} />

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Subscription List */}
              <div className="space-y-4 lg:col-span-2">
                {/* Search and Sort */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Search subscriptions..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={v => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nextRenewal">Next renewal</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subscription Cards */}
                <div className="space-y-3">
                  {filteredSubscriptions.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">
                      No subscriptions match your search
                    </p>
                  ) : (
                    filteredSubscriptions.map(sub => (
                      <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <UpcomingRenewals subscriptions={subscriptions} />
                <CategoryBreakdown subscriptions={subscriptions} currency={settings.currency} />
              </div>
            </div>
          </div>
        )}
      </main>

      <SubscriptionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        subscription={editingSubscription}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </div>
  );
}
