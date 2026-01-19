import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function usePushNotification() {
  const { isAuthenticated } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const registerTokenMutation = trpc.pushToken.register.useMutation();

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      console.log("Push notifications not supported");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        await subscribeUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setIsSubscribed(true);
        return existingSubscription;
      }

      // Create new subscription
      // Note: In production, you would use VAPID keys
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("VAPID public key not found");
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      // Register token with backend
      if (isAuthenticated) {
        const platform = detectPlatform();
        await registerTokenMutation.mutateAsync({
          token: JSON.stringify(subscription),
          platform,
        });
      }

      setIsSubscribed(true);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  };

  // Show local notification (for testing)
  const showLocalNotification = (title: string, body: string, url?: string) => {
    if (permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    const options: NotificationOptions = {
      body,
      icon: "/logo.png",
      badge: "/badge.png",
      data: { url: url || "/" },
    };

    new Notification(title, options);
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribeUser,
    unsubscribe,
    showLocalNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

// Detect platform (iOS, Android, Web)
function detectPlatform(): "ios" | "android" | "web" {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }
  if (/android/.test(userAgent)) {
    return "android";
  }
  return "web";
}
