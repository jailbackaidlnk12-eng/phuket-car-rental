# Zero-Cost Mirin Implementation Todo

- [x] **Database Migration**
  - [x] Install `better-sqlite3` and `drizzle-kit`
  - [x] Convert schema from MySQL to SQLite (`drizzle/schema.ts`)
  - [x] Update `db.ts` to use SQLite
  - [x] Configure `drizzle.config.ts`

- [x] **Authentication Replacement**
  - [x] Remove Manus/OAuth dependencies
  - [x] Implement Local Auth (Bcrypt + JWT + Cookies)
  - [x] Create Login Page
  - [x] Create Register Page
  - [x] Update `useAuth` hook

- [x] **Payment System Replacement**
  - [x] Remove Stripe dependencies
  - [x] Implement PromptPay QR Generator
  - [x] Update `Payments.tsx` to display QR
  - [x] Create Admin Confirmation API (`payments.confirm`)

- [x] **Maps Replacement**
  - [x] Remove Google Maps API
  - [x] Implement Leaflet / OpenStreetMap
  - [x] Update `Map.tsx` component

- [x] **Storage Replacement**
  - [x] Remove Forge Storage / S3
  - [x] Implement Local Filesystem Storage (`server/storage.ts`)
  - [x] Update `IdCardVerification.tsx` upload logic

- [x] **Notification System**
  - [x] Remove Forge Push
  - [x] Generate VAPID Keys
  - [x] Implement Web Push (`web-push` library)
  - [x] Integrate with Payment & Verification events

- [x] **Final Polish & Cleanup**
  - [x] Remove unused dependencies (`stripe`, `mysql2`, `@types/google.maps`)
  - [x] Verify ID Card Verification logic
  - [x] Document usage in `walkthrough.md`

## Status
All tasks completed. System is 100% Zero-Cost and Self-Hosted.
**Requirement**: Windows Build Tools for `better-sqlite3`.
