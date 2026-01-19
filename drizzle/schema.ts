import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Using local username/password authentication.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  balance: real("balance").default(0).notNull(),
  lastIp: text("lastIp"),
  lastLocation: text("lastLocation"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table for flexible rental inventory (Cars, Rooms, Yachts, etc.)
 */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(), // Brand + Model or Room Name
  category: text("category", { enum: ["car", "motorcycle", "room", "yacht", "other"] }).default("car").notNull(),
  licensePlate: text("licensePlate"), // Optional, for vehicles
  hourlyRate: real("hourlyRate"),
  dailyRate: real("dailyRate").notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  status: text("status", { enum: ["available", "rented", "maintenance", "cleaning"] }).default("available").notNull(),
  metadata: text("metadata", { mode: "json" }), // Flexible JSON for specific attributes (e.g., bedSize, engineCapacity)
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Rentals table for tracking motorcycle rentals
 */
export const rentals = sqliteTable("rentals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(), // Changed from carId
  startDate: integer("startDate", { mode: "timestamp" }).notNull(),
  endDate: integer("endDate", { mode: "timestamp" }).notNull(),
  actualReturnDate: integer("actualReturnDate", { mode: "timestamp" }),
  status: text("status", { enum: ["pending", "active", "completed", "cancelled"] }).default("pending").notNull(),
  totalCost: real("totalCost"),
  location: text("location"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Rental = typeof rentals.$inferSelect; export type InsertRental = typeof rentals.$inferInsert;

/**
 * Payments table for tracking payments and top-ups (PromptPay)
 */
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  rentalId: integer("rentalId"),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["top_up", "rental_charge", "extension"] }).default("top_up").notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).default("pending").notNull(),
  promptPayRef: text("promptPayRef"),
  confirmedBy: integer("confirmedBy"),
  confirmedAt: integer("confirmedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Notifications table for tracking user notifications
 */
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  rentalId: integer("rentalId"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["expiration_warning", "rental_confirmed", "payment_received", "extension_available", "id_verification"] }).notNull(),
  isRead: integer("isRead", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * ID Cards table for user verification
 */
export const idCards = sqliteTable("idCards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  idNumber: text("idNumber").notNull(),
  fullName: text("fullName").notNull(),
  dateOfBirth: text("dateOfBirth"),
  imageUrl: text("imageUrl").notNull(),
  imageUrlWithWatermark: text("imageUrlWithWatermark"),
  status: text("status", { enum: ["pending", "verified", "rejected"] }).default("pending").notNull(),
  verifiedBy: integer("verifiedBy"),
  verificationNotes: text("verificationNotes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type IdCard = typeof idCards.$inferSelect;
export type InsertIdCard = typeof idCards.$inferInsert;

/**
 * Push Tokens table for notifications (iOS/Android/Web)
 */
export const pushTokens = sqliteTable("pushTokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  token: text("token").notNull(),
  platform: text("platform", { enum: ["ios", "android", "web"] }).notNull(),
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = typeof pushTokens.$inferInsert;

/**
 * Audit Logs table for tracking admin actions
 */
export const auditLogs = sqliteTable("auditLogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(), // Admin who performed the action
  action: text("action", {
    enum: ["create", "update", "delete", "approve", "reject", "confirm", "cancel"]
  }).notNull(),
  targetTable: text("targetTable", {
    enum: ["users", "cars", "rentals", "payments", "idCards", "notifications"]
  }).notNull(),
  targetId: integer("targetId").notNull(),
  oldValue: text("oldValue"), // JSON string of old values
  newValue: text("newValue"), // JSON string of new values
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * System Settings table for app configuration
 */
export const systemSettings = sqliteTable("systemSettings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: integer("updatedBy"),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * Orders table for cannabis product purchases
 */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  status: text("status", {
    enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]
  }).default("pending").notNull(),
  totalAmount: real("totalAmount").notNull(),
  paymentId: integer("paymentId"),
  shippingAddress: text("shippingAddress"),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order Items table for individual products in an order
 */
export const orderItems = sqliteTable("orderItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: real("pricePerUnit").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

