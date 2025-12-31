import { Plus, Settings, Moon, Sun, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSettings } from '@/hooks';

interface HeaderProps {
  onAddSubscription: () => void;
  onExport?: () => void;
  onOpenSettings?: () => void;
}

export function Header({ onAddSubscription, onExport, onOpenSettings }: HeaderProps) {
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="app icon">
            💳
          </span>
          <h1 className="text-lg font-semibold">SubTracker</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onAddSubscription} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleTheme}>
                {settings.theme === 'dark' ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Light mode
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark mode
                  </>
                )}
              </DropdownMenuItem>
              {onExport && (
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export data
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onOpenSettings && (
                <DropdownMenuItem onClick={onOpenSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
