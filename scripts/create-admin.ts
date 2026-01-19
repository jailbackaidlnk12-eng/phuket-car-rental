
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { hashPassword } from "../server/auth/local-auth";

async function createAdmin() {
    const db = getDb();
    if (!db) {
        console.error("Database connection failed");
        return;
    }

    const passwordHash = await hashPassword("admin123");

    await db.insert(users).values({
        username: "admin",
        passwordHash,
        name: "System Admin",
        role: "admin",
        balance: 1000000,
    });

    console.log("Admin user created successfully.");
}

createAdmin();
