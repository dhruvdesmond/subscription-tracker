import { useState, useCallback, useSyncExternalStore } from 'react';
import { notificationService } from '@/services';

// External store for notification support
function subscribeToNotificationSupport() {
  // No subscription needed - this doesn't change
  return () => {};
}

function getNotificationSupport() {
  return notificationService.isSupported();
}

function getNotificationPermission() {
  return notificationService.getPermission();
}

export function useNotifications() {
  const isSupported = useSyncExternalStore(
    subscribeToNotificationSupport,
    getNotificationSupport,
    () => false // Server snapshot
  );

  const [permission, setPermission] = useState<NotificationPermission>(() =>
    isSupported ? getNotificationPermission() : 'denied'
  );

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermission());
    return granted;
  }, [isSupported]);

  return {
    permission,
    isSupported,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isPending: permission === 'default',
    requestPermission,
  };
}
