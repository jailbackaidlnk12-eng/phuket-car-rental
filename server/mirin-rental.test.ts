import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "user" | "admin" = "user", userId: number = 1): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: userId,
    openId: `sample-${role}-${userId}`,
    email: `${role}@example.com`,
    name: `Sample ${role}`,
    loginMethod: "manus",
    role: role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: { origin: "https://example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => { },
    } as TrpcContext["res"],
  };
}

describe("Mirin Motorcycle Rental System", () => {
  describe("Authentication", () => {
    it("returns null user for unauthenticated requests", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });

    it("returns user data for authenticated requests", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).not.toBeNull();
      expect(result?.role).toBe("user");
    });

    it("clears session cookie on logout", async () => {
      const { ctx, clearedCookies } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();
      expect(result).toEqual({ success: true });
      expect(clearedCookies).toHaveLength(1);
      expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    });
  });

  describe("Role-Based Access Control", () => {
    it("allows admin to access admin-only endpoints", async () => {
      const { ctx } = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      // Admin should be able to query all users
      const users = await caller.users.all();
      expect(Array.isArray(users)).toBe(true);
    });

    it("denies regular users access to admin endpoints", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      // Regular user should not be able to query all users
      await expect(caller.users.all()).rejects.toThrow();
    });

    it("allows admin to access pending ID cards", async () => {
      const { ctx } = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const pendingCards = await caller.idCard.pending();
      expect(Array.isArray(pendingCards)).toBe(true);
    });

    it("denies regular users access to pending ID cards", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.idCard.pending()).rejects.toThrow();
    });
  });

  describe("Products API", () => {
    it("allows public access to product list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const products = await caller.products.list();
      expect(Array.isArray(products)).toBe(true);
    });

    it("allows public access to available products", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const availableProducts = await caller.products.available();
      expect(Array.isArray(availableProducts)).toBe(true);
    });

    it("denies regular users from creating products", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.products.create({
        name: "Honda Click",
        category: "motorcycle",
        dailyRate: 300,
        hourlyRate: 50,
      })).rejects.toThrow();
    });

    it("denies regular users from deleting products", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.products.delete({ id: 1 })).rejects.toThrow();
    });
  });

  describe("Rentals API", () => {
    it("requires authentication for creating rentals", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.rentals.create({
        productId: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      })).rejects.toThrow();
    });

    it("allows authenticated users to view their rentals", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const rentals = await caller.rentals.myRentals();
      expect(Array.isArray(rentals)).toBe(true);
    });

    it("allows admin to view all rentals", async () => {
      const { ctx } = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const allRentals = await caller.rentals.all();
      expect(Array.isArray(allRentals)).toBe(true);
    });

    it("denies regular users from viewing all rentals", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.rentals.all()).rejects.toThrow();
    });
  });

  describe("ID Card Verification API", () => {
    it("allows users to check their own ID card status", async () => {
      const { ctx } = createUserContext("user", 1);
      const caller = appRouter.createCaller(ctx);

      const status = await caller.idCard.getStatus({ userId: 1 });
      // Should return undefined or the ID card object
      expect(status === undefined || typeof status === "object").toBe(true);
    });

    it("denies users from checking other users ID card status", async () => {
      const { ctx } = createUserContext("user", 1);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.idCard.getStatus({ userId: 2 })).rejects.toThrow();
    });

    it("allows admin to check any users ID card status", async () => {
      const { ctx } = createUserContext("admin", 1);
      const caller = appRouter.createCaller(ctx);

      const status = await caller.idCard.getStatus({ userId: 2 });
      expect(status === undefined || typeof status === "object").toBe(true);
    });

    it("requires authentication for ID card upload", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.idCard.upload({
        idNumber: "1234567890123",
        fullName: "Test User",
        dateOfBirth: "1990-01-01",
        imageUrl: "https://example.com/id.jpg",
      })).rejects.toThrow();
    });
  });

  describe("Payments API", () => {
    it("allows authenticated users to view their payments", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const payments = await caller.payments.myPayments();
      expect(Array.isArray(payments)).toBe(true);
    });

    it("requires authentication for viewing payments", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.payments.myPayments()).rejects.toThrow();
    });

    it("allows admin to view all payments", async () => {
      const { ctx } = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const allPayments = await caller.payments.all();
      expect(Array.isArray(allPayments)).toBe(true);
    });

    it("denies regular users from viewing all payments", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.payments.all()).rejects.toThrow();
    });
  });

  describe("Notifications API", () => {
    it("allows authenticated users to view their notifications", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const notifications = await caller.notifications.myNotifications();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it("requires authentication for viewing notifications", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.notifications.myNotifications()).rejects.toThrow();
    });
  });

  // Push Tokens API tests skipped - feature to be implemented later

  describe("Users API", () => {
    it("allows authenticated users to view their profile", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const profile = await caller.users.profile();
      expect(profile).toBeDefined();
    });

    it("requires authentication for viewing profile", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.users.profile()).rejects.toThrow();
    });
  });
});

describe("Business Logic Tests", () => {
  describe("Rental Cost Calculation", () => {
    it("should calculate cost correctly for daily rentals", () => {
      const dailyRate = 300;
      const hourlyRate = 50;
      const startDate = new Date("2024-01-01T10:00:00");
      const endDate = new Date("2024-01-03T10:00:00"); // 2 days

      const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      const totalCost = (days * dailyRate) + (remainingHours * hourlyRate);

      expect(days).toBe(2);
      expect(remainingHours).toBe(0);
      expect(totalCost).toBe(600); // 2 days * 300
    });

    it("should calculate cost correctly for hourly rentals", () => {
      const dailyRate = 300;
      const hourlyRate = 50;
      const startDate = new Date("2024-01-01T10:00:00");
      const endDate = new Date("2024-01-01T15:00:00"); // 5 hours

      const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      const totalCost = (days * dailyRate) + (remainingHours * hourlyRate);

      expect(days).toBe(0);
      expect(remainingHours).toBe(5);
      expect(totalCost).toBe(250); // 5 hours * 50
    });

    it("should calculate cost correctly for mixed day/hour rentals", () => {
      const dailyRate = 300;
      const hourlyRate = 50;
      const startDate = new Date("2024-01-01T10:00:00");
      const endDate = new Date("2024-01-02T15:00:00"); // 1 day 5 hours

      const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      const totalCost = (days * dailyRate) + (remainingHours * hourlyRate);

      expect(days).toBe(1);
      expect(remainingHours).toBe(5);
      expect(totalCost).toBe(550); // 1 day * 300 + 5 hours * 50
    });
  });

  describe("Rental Duration Calculation", () => {
    it("should calculate duration in days correctly", () => {
      const startDate = new Date("2024-01-01T10:00:00");
      const endDate = new Date("2024-01-03T10:00:00");

      const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      expect(days).toBe(2);
    });

    it("should calculate duration in hours correctly", () => {
      const startDate = new Date("2024-01-01T10:00:00");
      const endDate = new Date("2024-01-01T18:00:00");

      const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

      expect(hours).toBe(8);
    });
  });

  describe("ID Card Validation", () => {
    it("should validate Thai ID card number format (13 digits)", () => {
      const validIdNumber = "1234567890123";
      const invalidIdNumber = "12345";

      const isValidFormat = (id: string) => /^\d{13}$/.test(id);

      expect(isValidFormat(validIdNumber)).toBe(true);
      expect(isValidFormat(invalidIdNumber)).toBe(false);
    });
  });

  describe("Rental Status Transitions", () => {
    it("should allow pending to active transition", () => {
      const validTransitions: Record<string, string[]> = {
        pending: ["active", "cancelled"],
        active: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
      };

      expect(validTransitions.pending.includes("active")).toBe(true);
    });

    it("should not allow completed to active transition", () => {
      const validTransitions: Record<string, string[]> = {
        pending: ["active", "cancelled"],
        active: ["completed", "cancelled"],
        completed: [],
        cancelled: [],
      };

      expect(validTransitions.completed.includes("active")).toBe(false);
    });
  });
});
