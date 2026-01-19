import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(role: "admin" | "user" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      username: "test-user",
      passwordHash: "hashed-password",
      name: "Test User",
      email: "test@example.com",
      balance: 0,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { origin: "http://localhost:3000" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("Product Rental System", () => {
  describe("Products Router", () => {
    it("should list all products", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const products = await caller.products.list();
      expect(Array.isArray(products)).toBe(true);
    });

    it("should get available products", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const products = await caller.products.available();
      expect(Array.isArray(products)).toBe(true);
    });

    it("should require admin to create product", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.products.create({
          name: "Toyota Camry",
          category: "car",
          dailyRate: 50,
          hourlyRate: 5,
        });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("admin should be able to create product", async () => {
      const ctx = createMockContext("admin");
      const caller = appRouter.createCaller(ctx);
      const uniqueLicensePlate = `TEST-${Date.now()}`;
      const product = await caller.products.create({
        name: "Toyota Camry",
        category: "car",
        licensePlate: uniqueLicensePlate,
        dailyRate: 50,
        hourlyRate: 5,
      });
      expect(product).toBeDefined();
      expect(product.name).toBe("Toyota Camry");
    });
  });

  describe("Rentals Router", () => {
    it("should get user rentals", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const rentals = await caller.rentals.myRentals();
      expect(Array.isArray(rentals)).toBe(true);
    });

    it("should get active rental", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const rental = await caller.rentals.activeRental();
      expect(rental === null || rental === undefined || typeof rental === "object").toBe(true);
    });

    it("should require admin to approve rental", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.rentals.approve({ id: 1 });
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Payments Router", () => {
    it("should get user payments", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const payments = await caller.payments.myPayments();
      expect(Array.isArray(payments)).toBe(true);
    });

    it("should require admin to view all payments", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.payments.all();
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Notifications Router", () => {
    it("should get user notifications", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const notifications = await caller.notifications.myNotifications();
      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe("Users Router", () => {
    it("should get user profile", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const profile = await caller.users.profile();
      expect(profile).toBeDefined();
      expect(profile?.id).toBe(1);
    });

    it("should require admin to view all users", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.users.all();
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("Auth Router", () => {
    it("should get current user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const user = await caller.auth.me();
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
    });

    it("should logout user", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();
      expect(result.success).toBe(true);
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });

  describe("Role-Based Access Control", () => {
    it("should prevent non-admin from creating products", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.products.create({
          name: "Toyota Camry",
          category: "car",
          dailyRate: 50,
          hourlyRate: 5,
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should prevent non-admin from deleting products", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.products.delete({ id: 1 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should prevent non-admin from approving rentals", async () => {
      const ctx = createMockContext("user");
      const caller = appRouter.createCaller(ctx);
      try {
        await caller.rentals.approve({ id: 1 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});
