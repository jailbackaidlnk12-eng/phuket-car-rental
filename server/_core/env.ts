export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "mirin-local-secret-key-change-in-production",
  isProduction: process.env.NODE_ENV === "production",
  // PromptPay settings
  promptPayId: process.env.PROMPTPAY_ID ?? "0812345678", // Default phone number
  // Web Push VAPID settings
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidEmail: process.env.VAPID_EMAIL ?? "admin@mirin-rental.local",
};
