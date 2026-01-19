# Deployment Guide for Mirin (Luxcenry) System

This guide explains how to deploy the application to **Render.com** as a Web Service.

## Prerequisites
- A [Render.com](https://render.com) account.
- Your code pushed to a Git repository (GitHub/GitLab).

## Service Configuration

1. **New Web Service**: Connect your repository.
2. **Runtime**: Node
3. **Build Command**: `pnpm install && pnpm build`
   - *Note*: If you don't have pnpm in the build image, you might need `npm install && npm run build` (but we use pnpm lockfile). Render supports pnpm if you set `ENABLE_PNPM=1` env var? Or just use `npm install -g pnpm && pnpm install && pnpm build`.
   - Simpler: `npm install && npm run build` (but this ignores pnpm-lock.yaml). 
   - Recommended: Add Environment Variable `ENABLE_PNPM` = `1` (Render supports this natively).
4. **Start Command**: `npm start`
   - This runs `node dist/index.js`.

## Persistent Storage (Critical for SQLite)
Since we are using **SQLite** (`mirin.db`), the database file is stored on the disk. Render Web Services have ephemeral file systems, meaning **your data will be wiped** on every deploy or restart unless you use a **Persistent Disk**.

1. Go to **Disks** in your Render service settings.
2. Click **Add Disk**.
3. **Mount Path**: `/opt/render/project/src/data`
   - Our code expects the DB at `./data/mirin.db` relative to the root. In Render, the root is usually `/opt/render/project/src`.
4. **Size**: 1GB (is sufficient for a start).

## Environment Variables
Add the following in the **Environment** tab:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Optimizes for performance |
| `PORT` | `3000` | (Or let Render assign one, our server respects `process.env.PORT`) |
| `JWT_SECRET` | `your-secure-secret` | For authentication |
| `VAPID_PUBLIC_KEY` | `(Genereted)` | For Push Notifications |
| `VAPID_PRIVATE_KEY` | `(Generated)` | For Push Notifications |
| `DB_PATH` | `/opt/render/project/src/data/mirin.db` | Explicit path ensures it uses the mounted disk |

## Post-Deploy Steps
1. **Seed Data**: You may need to run the seed script locally or add a build step.
   - Since the DB is on the persistent disk, you can run `npm run seed` as part of the build command *once*, or connect via SSH console to run it.
   - **Better**: The app will create an empty DB if missing. You can use the Admin Dashboard to create the Admin user or use the registration flow.
   - **Recommended**: SSH into the running service and run `npx tsx scripts/seed-cannabis.ts` to populate the cannabis products.

## Troubleshooting
- **Build Failures**: Check `package.json` scripts. Ensure TypeScript types are valid (`npm run check`).
- **DB Not Found**: Check the Mount Path. Ensure it matches `DB_PATH` env var.
