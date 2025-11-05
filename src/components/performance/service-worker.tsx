"use client";

import { useEffect, useState } from "react";

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export function ServiceWorkerProvider({
  onUpdate,
  onSuccess,
  onError,
}: ServiceWorkerConfig = {}) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      registerServiceWorker({ onUpdate, onSuccess, onError });
    }
  }, [onUpdate, onSuccess, onError]);

  return null;
}

async function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("Service Worker registered successfully:", registration);

    // Check for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log("New content is available; please refresh.");
              config.onUpdate?.(registration);
            } else {
              // Content is cached for offline use
              console.log("Content is cached for offline use.");
              config.onSuccess?.(registration);
            }
          }
        });
      }
    });

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_UPDATE_AVAILABLE") {
        config.onUpdate?.(registration);
      }
    });

    config.onSuccess?.(registration);
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    config.onError?.(error as Error);
  }
}

// Hook for service worker updates
export function useServiceWorkerUpdate() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // Service worker has been updated
        window.location.reload();
      });
    }
  }, []);

  const updateServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        void registration.update();
      }
    }
  };

  const skipWaiting = async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    }
  };

  return { updateServiceWorker, skipWaiting };
}

// Hook for offline detection
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOffline;
}

// Component to show update notification
interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateNotification({
  onUpdate,
  onDismiss,
}: UpdateNotificationProps) {
  return (
    <div className="fixed right-4 bottom-4 z-50 rounded-lg bg-blue-600 p-4 text-white shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <p className="font-medium">New version available!</p>
          <p className="text-sm opacity-90">
            Click to update and reload the app.
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onUpdate}
            className="rounded bg-white px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-gray-100"
          >
            Update
          </button>
          <button
            onClick={onDismiss}
            className="text-white transition-colors hover:text-gray-200"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// Offline indicator component
export function OfflineIndicator() {
  const isOffline = useOfflineStatus();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 bg-yellow-500 py-2 text-center text-white">
      <p className="text-sm font-medium">
        You are currently offline. Some features may not be available.
      </p>
    </div>
  );
}

// Cache management utilities
export const cacheUtils = {
  async clearCache() {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName)),
      );
    }
  },

  async getCacheSize() {
    if (
      typeof window !== "undefined" &&
      "caches" in window &&
      "storage" in navigator &&
      "estimate" in navigator.storage
    ) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage ?? 0,
        quota: estimate.quota ?? 0,
        percentage:
          estimate.usage && estimate.quota
            ? Math.round((estimate.usage / estimate.quota) * 100)
            : 0,
      };
    }
    return null;
  },

  async preloadRoute(route: string) {
    if ("caches" in window) {
      const cache = await caches.open("replivity-dynamic-v1");
      try {
        await cache.add(route);
        console.log(`Route ${route} preloaded successfully`);
      } catch (error) {
        console.error(`Failed to preload route ${route}:`, error);
      }
    }
  },
};
