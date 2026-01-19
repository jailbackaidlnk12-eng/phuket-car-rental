import { relations } from "drizzle-orm";
import { users, cars, rentals, payments, notifications, idCards, pushTokens } from "./schema";

/**
 * User Relations
 * - One user has many rentals, payments, notifications, idCards, pushTokens
 */
export const usersRelations = relations(users, ({ many }) => ({
    rentals: many(rentals),
    payments: many(payments),
    notifications: many(notifications),
    idCards: many(idCards),
    pushTokens: many(pushTokens),
}));

/**
 * Car Relations
 * - One car has many rentals
 */
export const carsRelations = relations(cars, ({ many }) => ({
    rentals: many(rentals),
}));

/**
 * Rental Relations
 * - Each rental belongs to one user and one car
 * - One rental has many payments
 */
export const rentalsRelations = relations(rentals, ({ one, many }) => ({
    user: one(users, {
        fields: [rentals.userId],
        references: [users.id],
    }),
    car: one(cars, {
        fields: [rentals.carId],
        references: [cars.id],
    }),
    payments: many(payments),
}));

/**
 * Payment Relations
 * - Each payment belongs to one user
 * - Payment may belong to a rental (for rental_charge or extension)
 */
export const paymentsRelations = relations(payments, ({ one }) => ({
    user: one(users, {
        fields: [payments.userId],
        references: [users.id],
    }),
    rental: one(rentals, {
        fields: [payments.rentalId],
        references: [rentals.id],
    }),
    confirmedByUser: one(users, {
        fields: [payments.confirmedBy],
        references: [users.id],
    }),
}));

/**
 * Notification Relations
 * - Each notification belongs to one user
 * - May reference a rental
 */
export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

/**
 * ID Card Relations
 * - Each ID card belongs to one user
 * - May be verified by an admin user
 */
export const idCardsRelations = relations(idCards, ({ one }) => ({
    user: one(users, {
        fields: [idCards.userId],
        references: [users.id],
    }),
    verifiedByUser: one(users, {
        fields: [idCards.verifiedBy],
        references: [users.id],
    }),
}));

/**
 * Push Token Relations
 * - Each push token belongs to one user
 */
export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
    user: one(users, {
        fields: [pushTokens.userId],
        references: [users.id],
    }),
}));
