import { SubscriptionProvider } from '@/contexts/SubscriptionProvider';
import { SettingsProvider } from '@/contexts/SettingsProvider';
import { DashboardPage } from '@/pages';

function App() {
  return (
    <SettingsProvider>
      <SubscriptionProvider>
        <DashboardPage />
      </SubscriptionProvider>
    </SettingsProvider>
  );
}

export default App;
