import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { getDb } from "../server/db";

async function main() {
    console.log("Starting migration...");
    const db = getDb();
    if (!db) {
        throw new Error("Failed to connect to database");
    }

    // Cast to any to avoid type check issues with generic migrator
    await migrate(db as any, { migrationsFolder: "./drizzle" });
    console.log("Migration completed successfully 🚀");
}

main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
