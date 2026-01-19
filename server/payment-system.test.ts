import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", async () => {
    return {
        getAdmins: vi.fn(),
        createNotification: vi.fn(),
        createPayment: vi.fn(),
        getUserRentals: vi.fn(),
        getProductById: vi.fn(),
        createRental: vi.fn(),
        getUserByUsername: vi.fn(),
    };
});

function createMockContext(role: "admin" | "user" = "user"): TrpcContext {
    return {
        user: {
            id: 1,
            username: "test-user",
            passwordHash: "hashed",
            name: "Test User",
            email: "test@example.com",
            balance: 1000,
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
        },
        req: {
            protocol: "https",
            headers: { origin: "http://localhost:3000" },
        } as any,
        res: {
            clearCookie: vi.fn(),
        } as any,
    };
}

describe("Payment System Enhancements", () => {
    it("should add random satang to top-up amount", async () => {
        const ctx = createMockContext();
        const caller = appRouter.createCaller(ctx);
        const amount = 100;

        // Mock dependencies
        (db.createPayment as any).mockResolvedValue({ id: 1 });
        (db.getAdmins as any).mockResolvedValue([{ id: 99, role: "admin", username: "admin" }]);
        (db.createNotification as any).mockResolvedValue({ id: 1 });

        const result = await caller.payments.topUp({ amount });

        // Verify amount has decimals
        expect(result.amount).not.toBe(amount);
        expect(result.amount).toBeGreaterThan(amount);
        expect(result.amount).toBeLessThan(amount + 1);
        expect(result.amount % 1).not.toBe(0);

        // Verify admin notification
        expect(db.getAdmins).toHaveBeenCalled();
        expect(db.createNotification).toHaveBeenCalledWith(expect.objectContaining({
            userId: 99,
            title: "New Top Up",
            type: "payment_received"
        }));
    });

    it("should add random satang to rental creation", async () => {
        const ctx = createMockContext();
        const caller = appRouter.createCaller(ctx);

        // Mock product and rental creation
        (db.getProductById as any).mockResolvedValue({
            id: 1, dailyRate: 500, status: 'available', name: 'Test Car', hourlyRate: 50
        });
        (db.createRental as any).mockResolvedValue({ id: 1, totalCost: 500 });
        (db.getAdmins as any).mockResolvedValue([{ id: 99, role: "admin" }]);
        (db.createPayment as any).mockResolvedValue({ id: 1 });

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 1 day

        const result = await caller.rentals.create({
            productId: 1,
            startDate,
            endDate
        });

        // Verify payment amount has decimals
        expect(result.payment.amount).not.toBe(500);
        expect(result.payment.amount).toBeGreaterThan(500);
        expect(result.payment.amount).toBeLessThan(501);

        // Verify admin notification
        expect(db.createNotification).toHaveBeenCalledWith(expect.objectContaining({
            userId: 99,
            title: "New Rental Request",
        }));
    });
});
