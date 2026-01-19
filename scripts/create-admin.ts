
import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { hashPassword } from "../server/auth/local-auth";

async function createAdmin() {
    const db = getDb();
    if (!db) {
        console.error("Database connection failed");
        return;
    }

    // Get username and password from command line arguments
    const username = process.argv[2] || "admin";
    const password = process.argv[3] || "admin123";

    const passwordHash = await hashPassword(password);

    await db.insert(users).values({
        username,
        passwordHash,
        name: `Admin ${username}`,
        role: "admin",
        balance: 1000000,
    });

    console.log(`Admin user '${username}' created successfully.`);
}

createAdmin();
