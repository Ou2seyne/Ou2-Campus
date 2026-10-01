'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY_PWA_DISMISSED = 'pillcal_pwa_dismissed_until_v2';

// 1. Online status store
function subscribeOnline(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}
function getOnlineSnapshot() {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}
function getServerOnlineSnapshot() {
  return true;
}

// 2. Standalone mode store
function subscribeStandalone(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(display-mode: standalone)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}
function getStandaloneSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}
function getServerStandaloneSnapshot(): boolean {
  return false;
}

// 3. iOS detection store
function getIosSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function getServerIosSnapshot(): boolean {
  return false;
}

// 4. Dismissed prompt store
let dismissedListeners: Array<() => void> = [];
function notifyDismissed() {
  dismissedListeners.forEach(fn => {
    try { fn(); } catch (e) { console.warn(e); }
  });
}
function subscribeDismissed(listener: () => void) {
  dismissedListeners.push(listener);
  return () => {
    dismissedListeners = dismissedListeners.filter(fn => fn !== listener);
  };
}
function getDismissedSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dismissedUntil = localStorage.getItem(STORAGE_KEY_PWA_DISMISSED);
    return Boolean(dismissedUntil && Number(dismissedUntil) > Date.now());
  } catch {
    return false;
  }
}
function getServerDismissedSnapshot(): boolean {
  return false;
}

export function usePwa() {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot
  );

  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getServerStandaloneSnapshot
  );

  const isIos = useSyncExternalStore(
    subscribeStandalone,
    getIosSnapshot,
    getServerIosSnapshot
  );

  const isDismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    getServerDismissedSnapshot
  );

  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [showReconnectedBadge, setShowReconnectedBadge] = useState<boolean>(false);
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Register service worker and handle beforeinstallprompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isLocalDev && process.env.NODE_ENV !== 'production') {
        // In local development, unregister any stale service workers to prevent chunk caching issues
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            keys.forEach((key) => caches.delete(key));
          });
        }
      } else {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            // If a worker is waiting, prompt update
            if (reg.waiting) {
              setWaitingWorker(reg.waiting);
              setHasUpdate(true);
            }

            reg.addEventListener('updatefound', () => {
              const installing = reg.installing;
              if (installing) {
                installing.addEventListener('statechange', () => {
                  if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                    setWaitingWorker(installing);
                    setHasUpdate(true);
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('PWA service worker registration notice:', err);
          });
      }
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Track offline -> online transition
  useEffect(() => {
    if (!isOnline) {
      const timer = setTimeout(() => {
        setWasOffline(true);
      }, 0);
      return () => clearTimeout(timer);
    } else if (wasOffline) {
      const timer1 = setTimeout(() => {
        setShowReconnectedBadge(true);
      }, 0);
      const timer2 = setTimeout(() => {
        setShowReconnectedBadge(false);
        setWasOffline(false);
      }, 4000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOnline, wasOffline]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!installPromptEvent) return false;
    try {
      await installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPromptEvent(null);
        return true;
      }
    } catch (e) {
      console.warn('Installation error:', e);
    }
    return false;
  }, [installPromptEvent]);

  const dismissPrompt = useCallback((days = 7) => {
    try {
      const until = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY_PWA_DISMISSED, String(until));
    } catch (e) {
      console.warn(e);
    }
    notifyDismissed();
  }, []);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [waitingWorker]);

  const canInstall = !isStandalone && (installPromptEvent !== null || isIos);

  return {
    isOnline,
    wasOffline,
    showReconnectedBadge,
    isStandalone,
    isIos,
    isDismissed,
    canInstall,
    isInstallable: installPromptEvent !== null,
    hasUpdate,
    applyUpdate,
    promptInstall,
    dismissPrompt,
  };
}
