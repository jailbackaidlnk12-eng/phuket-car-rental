import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword, generateToken, setAuthCookie, clearAuthCookie } from "./auth/local-auth";
import { generatePromptPayQR, formatThbAmount, addRandomSatang } from "./payment/promptpay";
import { storeBase64File } from "./storage";
import { sendPushNotification } from "./notifications/web-push";

// Create adminProcedure - use protectedProcedure as fallback
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        username: z.string().min(3).max(50),
        password: z.string().min(6),
        name: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if username exists
        const existing = await db.getUserByUsername(input.username);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Username already exists" });
        }

        // Hash password
        const passwordHash = await hashPassword(input.password);

        // Create user
        const user = await db.createUser({
          username: input.username,
          passwordHash,
          name: input.name,
          email: input.email,
          role: "user",
          balance: 0,
        });

        if (!user) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
        }

        // Generate token and set cookie
        const token = await generateToken({
          userId: user.id,
          username: user.username,
          role: user.role as "user" | "admin",
        });

        setAuthCookie(ctx.res, token);

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          },
        };
      }),

    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
        }

        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
        }

        // Update last signed in
        await db.updateUserLastSignedIn(user.id);

        // Generate token and set cookie
        const token = await generateToken({
          userId: user.id,
          username: user.username,
          role: user.role as "user" | "admin",
        });

        setAuthCookie(ctx.res, token);

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          },
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      clearAuthCookie(ctx.res);
      return { success: true } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(async () => db.getAllProducts()),
    available: publicProcedure.query(async () => db.getAvailableProducts()),
    detail: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        return product;
      }),
    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          category: z.enum(["car", "motorcycle", "room", "yacht", "other"]),
          licensePlate: z.string().optional(),
          hourlyRate: z.number().optional(),
          dailyRate: z.number(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          metadata: z.any().optional(), // Flexible metadata
        })
      )
      .mutation(async ({ input }) => db.createProduct(input)),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          category: z.enum(["car", "motorcycle", "room", "yacht", "other"]).optional(),
          licensePlate: z.string().optional(),
          hourlyRate: z.number().optional(),
          dailyRate: z.number().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          status: z.enum(["available", "rented", "maintenance", "cleaning"]).optional(),
          metadata: z.any().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.deleteProduct(input.id)),
  }),

  rentals: router({
    myRentals: protectedProcedure.query(async ({ ctx }) => db.getUserRentals(ctx.user.id)),
    activeRental: protectedProcedure.query(async ({ ctx }) => db.getActiveRentalByUser(ctx.user.id)),
    detail: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const rental = await db.getRentalById(input.id);
        if (!rental) throw new TRPCError({ code: "NOT_FOUND", message: "Rental not found" });
        if (rental.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        return rental;
      }),
    create: protectedProcedure
      .input(z.object({ productId: z.number(), startDate: z.date(), endDate: z.date() }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        if (product.status !== "available") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Product is not available" });
        }

        const hours = Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60));
        const days = Math.ceil(hours / 24);
        const totalCost = days * product.dailyRate;

        // Create rental
        const rental = await db.createRental({
          userId: ctx.user.id,
          productId: input.productId,
          startDate: input.startDate,
          endDate: input.endDate,
          status: "pending",
          totalCost,
        });

        // Add random satang for precise matching
        const preciseAmount = addRandomSatang(totalCost);

        // Generate PromptPay QR for payment
        const qrResult = await generatePromptPayQR(preciseAmount);

        // Create pending payment
        await db.createPayment({
          userId: ctx.user.id,
          rentalId: rental?.id,
          amount: preciseAmount,
          type: "rental_charge",
          status: "pending",
          promptPayRef: qrResult.referenceId,
        });

        // Notify Admins
        const admins = await db.getAdmins();
        for (const admin of admins) {
          await db.createNotification({
            userId: admin.id,
            title: "New Rental Request",
            message: `User ${ctx.user.username} requested a rental. Payment: ฿${formatThbAmount(preciseAmount)}`,
            type: "payment_received",
            isRead: false,
          });
        }

        return {
          rental,
          payment: {
            qrCodeDataUrl: qrResult.qrCodeDataUrl,
            amount: preciseAmount,
            amountFormatted: formatThbAmount(preciseAmount),
            referenceId: qrResult.referenceId,
          },
        };
      }),
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const rental = await db.getRentalById(input.id);
        if (!rental) throw new TRPCError({ code: "NOT_FOUND", message: "Rental not found" });
        await db.updateRental(input.id, { status: "active" });
        await db.updateProduct(rental.productId, { status: "rented" });
        return { success: true };
      }),
    cancel: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const rental = await db.getRentalById(input.id);
        if (!rental) throw new TRPCError({ code: "NOT_FOUND", message: "Rental not found" });
        await db.updateRental(input.id, { status: "cancelled" });
        await db.updateProduct(rental.productId, { status: "available" });
        return { success: true };
      }),
    complete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const rental = await db.getRentalById(input.id);
        if (!rental) throw new TRPCError({ code: "NOT_FOUND", message: "Rental not found" });
        if (rental.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        await db.updateRental(input.id, { status: "completed", actualReturnDate: new Date() });
        await db.updateProduct(rental.productId, { status: "available" });
        return { success: true };
      }),
    all: adminProcedure.query(async () => db.getAllRentals()),
  }),

  payments: router({
    myPayments: protectedProcedure.query(async ({ ctx }) => db.getUserPayments(ctx.user.id)),
    pending: adminProcedure.query(async () => db.getPendingPayments()),

    topUp: protectedProcedure
      .input(z.object({ amount: z.number().min(1) }))
      .mutation(async ({ input, ctx }) => {
        // Add random satang
        const preciseAmount = addRandomSatang(input.amount);

        // Generate PromptPay QR
        const qrResult = await generatePromptPayQR(preciseAmount);

        // Create pending payment
        await db.createPayment({
          userId: ctx.user.id,
          amount: preciseAmount,
          type: "top_up",
          status: "pending",
          promptPayRef: qrResult.referenceId,
        });

        // Notify Admins
        const admins = await db.getAdmins();
        for (const admin of admins) {
          await db.createNotification({
            userId: admin.id,
            title: "New Top Up",
            message: `User ${ctx.user.username} initiated top up: ฿${formatThbAmount(preciseAmount)}`,
            type: "payment_received",
            isRead: false,
          });
        }

        return {
          qrCodeDataUrl: qrResult.qrCodeDataUrl,
          amount: preciseAmount,
          amountFormatted: formatThbAmount(preciseAmount),
          referenceId: qrResult.referenceId,
        };
      }),

    extend: protectedProcedure
      .input(z.object({ rentalId: z.number(), days: z.number().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const rental = await db.getRentalById(input.rentalId);
        if (!rental) throw new TRPCError({ code: "NOT_FOUND", message: "Rental not found" });
        if (rental.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }

        const product = await db.getProductById(rental.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

        const extensionCost = input.days * product.dailyRate;
        const preciseAmount = addRandomSatang(extensionCost);

        // Generate PromptPay QR
        const qrResult = await generatePromptPayQR(preciseAmount);

        // Create pending payment
        await db.createPayment({
          userId: ctx.user.id,
          rentalId: input.rentalId,
          amount: preciseAmount,
          type: "extension",
          status: "pending",
          promptPayRef: qrResult.referenceId,
        });

        // Notify Admins
        const admins = await db.getAdmins();
        for (const admin of admins) {
          await db.createNotification({
            userId: admin.id,
            title: "Rental Extension",
            message: `User ${ctx.user.username} extended rental. Payment: ฿${formatThbAmount(preciseAmount)}`,
            type: "payment_received",
            isRead: false,
          });
        }

        return {
          qrCodeDataUrl: qrResult.qrCodeDataUrl,
          amount: preciseAmount,
          amountFormatted: formatThbAmount(preciseAmount),
          referenceId: qrResult.referenceId,
          days: input.days,
        };
      }),

    confirm: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const payment = await db.getPaymentById(input.id);
        if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
        if (payment.status !== "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Payment is not pending" });
        }

        // Update payment status
        await db.updatePayment(input.id, {
          status: "completed",
          confirmedBy: ctx.user.id,
          confirmedAt: new Date(),
        });

        // If it's a top-up, add balance
        if (payment.type === "top_up") {
          const user = await db.getUserById(payment.userId);
          if (user) {
            await db.updateUserBalance(payment.userId, user.balance + payment.amount);
          }
        }

        // If it's a rental charge, approve the rental
        if (payment.type === "rental_charge" && payment.rentalId) {
          const rental = await db.getRentalById(payment.rentalId);
          if (rental) {
            await db.updateRental(payment.rentalId, { status: "active" });
            await db.updateProduct(rental.productId, { status: "rented" });
          }
        }

        // If it's an extension, extend the rental
        if (payment.type === "extension" && payment.rentalId) {
          const rental = await db.getRentalById(payment.rentalId);
          if (rental) {
            // Calculate days based on payment amount and product rate
            const product = await db.getProductById(rental.productId);
            if (product) {
              const days = Math.round(payment.amount / product.dailyRate);
              const newEndDate = new Date(rental.endDate);
              newEndDate.setDate(newEndDate.getDate() + days);
              await db.updateRental(payment.rentalId, { endDate: newEndDate });
            }
          }
        }

        // Send notification
        await db.createNotification({
          userId: payment.userId,
          title: "Payment Confirmed",
          message: `Your payment of ฿${formatThbAmount(payment.amount)} has been confirmed.`,
          isRead: false,
          type: "payment_received",
        });

        sendPushNotification(payment.userId, {
          title: "Payment Confirmed",
          body: `Your payment of ฿${formatThbAmount(payment.amount)} has been confirmed`,
          url: "/payments",
        });

        return { success: true };
      }),

    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const payment = await db.getPaymentById(input.id);
        if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });

        await db.updatePayment(input.id, { status: "failed" });

        // If it's a rental charge, cancel the rental
        if (payment.type === "rental_charge" && payment.rentalId) {
          const rental = await db.getRentalById(payment.rentalId);
          if (rental) {
            await db.updateRental(payment.rentalId, { status: "cancelled" });
          }
        }

        return { success: true };
      }),

    all: adminProcedure.query(async () => db.getAllPayments()),
  }),

  notifications: router({
    myNotifications: protectedProcedure.query(async ({ ctx }) => db.getUserNotifications(ctx.user.id)),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.markNotificationAsRead(input.id)),
  }),

  users: router({
    profile: protectedProcedure.query(async ({ ctx }) => db.getUserById(ctx.user.id)),
    all: adminProcedure.query(async () => db.getAllUsers()),
    makeAdmin: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db2 = (await import("./db")).getDb();
        if (!db2) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { users: usersTable } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        await db2.update(usersTable).set({ role: "admin" }).where(eq(usersTable.id, input.userId));

        // Log admin action
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "update",
          targetTable: "users",
          targetId: input.userId,
          newValue: JSON.stringify({ role: "admin" }),
        });

        return { success: true };
      }),
    removeAdmin: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Prevent removing own admin
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot remove your own admin privileges" });
        }

        const db2 = (await import("./db")).getDb();
        if (!db2) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const { users: usersTable } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        await db2.update(usersTable).set({ role: "user" }).where(eq(usersTable.id, input.userId));

        await db.createAuditLog({
          userId: ctx.user.id,
          action: "update",
          targetTable: "users",
          targetId: input.userId,
          newValue: JSON.stringify({ role: "user" }),
        });

        return { success: true };
      }),
  }),

  // ===== DATABASE STATISTICS & AUDIT =====

  admin: router({
    stats: adminProcedure.query(async () => db.getDbStats()),
    auditLogs: adminProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => db.getAuditLogs(input?.limit ?? 100)),
    auditLogsByUser: adminProcedure
      .input(z.object({ userId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => db.getAuditLogsByUser(input.userId, input.limit ?? 50)),
  }),

  idCard: router({
    getStatus: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (input.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        return db.getIdCardByUserId(input.userId);
      }),
    upload: protectedProcedure
      .input(z.object({
        idNumber: z.string(),
        fullName: z.string(),
        dateOfBirth: z.string(),
        imageUrl: z.string(), // Base64 encoded image
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getIdCardByUserId(ctx.user.id);
        if (existing && existing.status === "verified") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "ID card already verified" });
        }

        // Store image locally
        const { url: storedImageUrl } = await storeBase64File(input.imageUrl, "idcards");

        if (existing) {
          await db.updateIdCard(existing.id, {
            idNumber: input.idNumber,
            fullName: input.fullName,
            dateOfBirth: input.dateOfBirth,
            imageUrl: storedImageUrl,
            status: "pending",
          });
          return { success: true };
        }

        await db.createIdCard({
          userId: ctx.user.id,
          idNumber: input.idNumber,
          fullName: input.fullName,
          dateOfBirth: input.dateOfBirth,
          imageUrl: storedImageUrl,
          status: "pending",
        });

        return { success: true };
      }),
    verify: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["verified", "rejected"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateIdCard(input.id, {
          status: input.status,
          verifiedBy: ctx.user.id,
          verificationNotes: input.notes,
        });

        const idCard = await db.getIdCardById(input.id);

        if (idCard) {
          const title = input.status === "verified" ? "ID Card Verified" : "ID Card Rejected";
          const message = input.status === "verified"
            ? "Your ID card has been verified. You can now rent motorcycles."
            : `Your ID card verification was rejected. ${input.notes ? "Reason: " + input.notes : ""}`;

          await db.createNotification({
            userId: idCard.userId,
            title,
            message,
            isRead: false,
            type: "id_verification",
          });

          sendPushNotification(idCard.userId, {
            title,
            body: message,
            url: "/id-verification",
          });
        }

        return { success: true };
      }),
    pending: adminProcedure.query(async () => db.getAllPendingIdCards()),
    all: adminProcedure.query(async () => db.getAllIdCards()),
  }),

  pushToken: router({
    register: protectedProcedure
      .input(z.object({
        token: z.string(),
        platform: z.enum(["ios", "android", "web"]),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createPushToken({
          userId: ctx.user.id,
          token: input.token,
          platform: input.platform,
        });
      }),
    deactivate: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => db.deactivatePushToken(input.token)),
  }),
});

export type AppRouter = typeof appRouter;
