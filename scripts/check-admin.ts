
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function checkAdmin() {
    const db = getDb();
    if (!db) {
        console.error("Database connection failed");
        return;
    }

    const admins = await db.select().from(users).where(eq(users.role, "admin"));

    if (admins.length > 0) {
        console.log("Found admin users:", admins.map(u => u.username));
    } else {
        console.log("No admin users found.");
    }
}

checkAdmin();
