import { eq, asc, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { InsertUser, users, products, rentals, payments, notifications, idCards, pushTokens, auditLogs, systemSettings } from "../drizzle/schema";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const DB_PATH = "./data/mirin.db";

let _db: ReturnType<typeof drizzle> | null = null;

// Ensure database directory exists and create drizzle instance
export function getDb() {
  if (!_db) {
    try {
      // Ensure data directory exists
      const dbDir = dirname(DB_PATH);
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }

      const sqlite = new Database(DB_PATH);
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.username) {
    throw new Error("Username is required for upsert");
  }

  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.username, user.username)).limit(1);

    if (existing.length > 0) {
      // Update existing user
      const updateSet: Record<string, unknown> = {
        lastSignedIn: new Date(),
        updatedAt: new Date(),
      };

      if (user.name !== undefined) updateSet.name = user.name;
      if (user.email !== undefined) updateSet.email = user.email;
      if (user.role !== undefined) updateSet.role = user.role;

      await db.update(users).set(updateSet).where(eq(users.username, user.username));
    } else {
      // Insert new user
      await db.insert(users).values({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByUsername(username: string) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(userData: InsertUser) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  }).returning();

  return result[0];
}

export async function updateUserLastSignedIn(userId: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(users).set({
    lastSignedIn: new Date(),
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

// ===== PRODUCT QUERIES (formerly Cars) =====

export async function getAllProducts() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(products).orderBy(asc(products.createdAt));
}

export async function getAvailableProducts() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(products).where(eq(products.status, "available")).orderBy(asc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(productData: typeof products.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values({
    ...productData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return result[0];
}

export async function updateProduct(id: number, productData: Partial<typeof products.$inferInsert>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(products).set({ ...productData, updatedAt: new Date() }).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(products).where(eq(products.id, id));
}

// ===== RENTAL QUERIES =====

export async function getUserRentals(userId: number) {
  const db = getDb();
  if (!db) return [];

  return db.select().from(rentals).where(eq(rentals.userId, userId)).orderBy(desc(rentals.createdAt));
}

export async function getActiveRentalByUser(userId: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(rentals)
    .where(and(eq(rentals.userId, userId), eq(rentals.status, "active")))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getRentalById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(rentals).where(eq(rentals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createRental(rentalData: typeof rentals.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(rentals).values({
    ...rentalData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return result[0];
}

export async function updateRental(id: number, rentalData: Partial<typeof rentals.$inferInsert>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(rentals).set({ ...rentalData, updatedAt: new Date() }).where(eq(rentals.id, id));
}

export async function getAllRentals() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(rentals).orderBy(desc(rentals.createdAt));
}

// ===== PAYMENT QUERIES =====

export async function getUserPayments(userId: number) {
  const db = getDb();
  if (!db) return [];

  return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
}

export async function getPaymentById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentByRef(ref: string) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(payments).where(eq(payments.promptPayRef, ref)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPayment(paymentData: typeof payments.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values({
    ...paymentData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return result[0];
}

export async function updatePayment(id: number, paymentData: Partial<typeof payments.$inferInsert>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(payments).set({ ...paymentData, updatedAt: new Date() }).where(eq(payments.id, id));
}

export async function getAllPayments() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

export async function getPendingPayments() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(payments).where(eq(payments.status, "pending")).orderBy(asc(payments.createdAt));
}

// ===== NOTIFICATION QUERIES =====

export async function getUserNotifications(userId: number) {
  const db = getDb();
  if (!db) return [];

  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function createNotification(notificationData: typeof notifications.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values({
    ...notificationData,
    createdAt: new Date(),
  }).returning();

  return result[0];
}

export async function markNotificationAsRead(id: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function updateUserBalance(userId: number, newBalance: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(users).set({ balance: newBalance, updatedAt: new Date() }).where(eq(users.id, userId));
}

// ===== ID CARD QUERIES =====

export async function getIdCardByUserId(userId: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(idCards).where(eq(idCards.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getIdCardById(id: number) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(idCards).where(eq(idCards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createIdCard(idCardData: typeof idCards.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(idCards).values({
    ...idCardData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return result[0];
}

export async function updateIdCard(id: number, idCardData: Partial<typeof idCards.$inferInsert>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(idCards).set({ ...idCardData, updatedAt: new Date() }).where(eq(idCards.id, id));
}

export async function getAllPendingIdCards() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(idCards).where(eq(idCards.status, "pending")).orderBy(asc(idCards.createdAt));
}

export async function getAllIdCards() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(idCards).orderBy(desc(idCards.createdAt));
}

// ===== PUSH TOKEN QUERIES =====

export async function getPushTokensByUserId(userId: number) {
  const db = getDb();
  if (!db) return [];

  return db.select().from(pushTokens).where(and(eq(pushTokens.userId, userId), eq(pushTokens.isActive, true)));
}

export async function createPushToken(tokenData: typeof pushTokens.$inferInsert) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(pushTokens).values({
    ...tokenData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { success: true };
}

export async function deactivatePushToken(token: string) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(pushTokens).set({ isActive: false, updatedAt: new Date() }).where(eq(pushTokens.token, token));
}

export async function getAllUsers() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAdmins() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(users).where(eq(users.role, "admin"));
}

// ===== AUDIT LOG QUERIES =====

export async function createAuditLog(logData: typeof auditLogs.$inferInsert) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot create audit log: database not available");
    return;
  }

  try {
    await db.insert(auditLogs).values({
      ...logData,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Failed to create audit log:", error);
  }
}

export async function getAuditLogs(limit = 100) {
  const db = getDb();
  if (!db) return [];

  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

export async function getAuditLogsByUser(userId: number, limit = 50) {
  const db = getDb();
  if (!db) return [];

  return db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

export async function getAuditLogsByTarget(targetTable: string, targetId: number) {
  const db = getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLogs)
    .where(and(eq(auditLogs.targetTable, targetTable as any), eq(auditLogs.targetId, targetId)))
    .orderBy(desc(auditLogs.createdAt));
}

// ===== SYSTEM SETTINGS QUERIES =====

export async function getSetting(key: string) {
  const db = getDb();
  if (!db) return undefined;

  const result = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
  return result.length > 0 ? result[0].value : undefined;
}

export async function setSetting(key: string, value: string, description?: string, updatedBy?: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);

  if (existing.length > 0) {
    await db.update(systemSettings).set({
      value,
      description,
      updatedBy,
      updatedAt: new Date(),
    }).where(eq(systemSettings.key, key));
  } else {
    await db.insert(systemSettings).values({
      key,
      value,
      description,
      updatedBy,
      updatedAt: new Date(),
    });
  }
}

export async function getAllSettings() {
  const db = getDb();
  if (!db) return [];

  return db.select().from(systemSettings);
}

// ===== DATABASE STATISTICS =====

export async function getDbStats() {
  const db = getDb();
  if (!db) {
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalRentals: 0,
      totalPayments: 0,
      pendingPayments: 0,
      pendingRentals: 0,
      pendingIdCards: 0,
      activeRentals: 0,
      availableProducts: 0,
    };
  }

  const [
    allUsers,
    allProducts,
    allRentals,
    allPayments,
    pendingPays,
    pendingRents,
    pendingIds,
    activeRents,
    availProducts,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(products),
    db.select().from(rentals),
    db.select().from(payments),
    db.select().from(payments).where(eq(payments.status, "pending")),
    db.select().from(rentals).where(eq(rentals.status, "pending")),
    db.select().from(idCards).where(eq(idCards.status, "pending")),
    db.select().from(rentals).where(eq(rentals.status, "active")),
    db.select().from(products).where(eq(products.status, "available")),
  ]);

  return {
    totalUsers: allUsers.length,
    totalProducts: allProducts.length,
    totalRentals: allRentals.length,
    totalPayments: allPayments.length,
    pendingPayments: pendingPays.length,
    pendingRentals: pendingRents.length,
    pendingIdCards: pendingIds.length,
    activeRentals: activeRents.length,
    availableProducts: availProducts.length,
  };
}

// ===== USER MANAGEMENT =====

export async function updateUser(userId: number, userData: Partial<typeof users.$inferInsert>) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  return db.update(users).set({ ...userData, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  // Delete related records first
  await db.delete(pushTokens).where(eq(pushTokens.userId, userId));
  await db.delete(notifications).where(eq(notifications.userId, userId));
  // Note: We keep payments and rentals for audit purposes

  return db.delete(users).where(eq(users.id, userId));
}
