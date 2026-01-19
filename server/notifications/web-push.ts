import webpush from "web-push";
import { ENV } from "../_core/env";
import { getPushTokensByUserId, deactivatePushToken } from "../db";

// Initialize web-push with VAPID keys
if (ENV.vapidPublicKey && ENV.vapidPrivateKey) {
    webpush.setVapidDetails(
        `mailto:${ENV.vapidEmail}`,
        ENV.vapidPublicKey,
        ENV.vapidPrivateKey
    );
} else {
    console.warn("VAPID keys not configured. Push notifications will not work.");
}

export type NotificationPayload = {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
};

export async function sendPushNotification(userId: number, payload: NotificationPayload) {
    try {
        const tokens = await getPushTokensByUserId(userId);

        if (tokens.length === 0) {
            return { success: false, error: "No active push tokens found for user" };
        }

        const notifications = tokens.map(async (tokenRecord) => {
            try {
                const subscription = JSON.parse(tokenRecord.token);

                await webpush.sendNotification(subscription, JSON.stringify({
                    title: payload.title,
                    body: payload.body,
                    url: payload.url || "/",
                    icon: payload.icon || "/logo.png",
                    badge: payload.badge || "/badge.png",
                }));

                return { success: true, token: tokenRecord.token };
            } catch (error: any) {
                // If 404/410, the subscription is expired/gone
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await deactivatePushToken(tokenRecord.token);
                }
                return { success: false, error, token: tokenRecord.token };
            }
        });

        await Promise.all(notifications);
        return { success: true, count: tokens.length };
    } catch (error) {
        console.error("Error sending push notification:", error);
        return { success: false, error };
    }
}
