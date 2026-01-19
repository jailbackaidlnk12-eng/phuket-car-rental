import "dotenv/config";
import { getDb } from "../server/db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const db = getDb();
if (!db) throw new Error("Failed to connect to DB");

async function seedCannabis() {
    console.log("Seeding Cannabis products...");

    const items = [
        {
            name: "Pink Oreoz",
            category: "other" as const,
            licensePlate: "ST-001",
            hourlyRate: 0,
            dailyRate: 650,
            description: "Hybrid 50/50. Sweet milk and cookie aroma.",
            imageUrl: "/pink_oreoz.png",
            status: "available" as const,
            metadata: JSON.stringify({
                type: "cannabis",
                strain: "Pink Oreoz",
                species: "Hybrid",
                ratio: "50% Sativa / 50% Indica",
                flavor: "Sweet milk, cookies, creamy sweetness with earth and chocolate notes.",
                effects: {
                    initial: "Euphoria, brain relaxation, creative.",
                    late: "Body relaxation, reduces stress/anxiety, not causing couch-lock."
                }
            })
        },
        {
            name: "Super Boof",
            category: "other" as const,
            licensePlate: "ST-002",
            hourlyRate: 0,
            dailyRate: 700,
            description: "Hybrid 30/70. Citrus, cherry, earthy.",
            imageUrl: "/super_boof.png",
            status: "available" as const,
            metadata: JSON.stringify({
                type: "cannabis",
                strain: "Super Boof",
                species: "Hybrid",
                ratio: "30% Sativa / 70% Indica",
                flavor: "Citrus, cherry, earthy.",
                effects: {
                    initial: "Clear-headed happiness, instant mood lift.",
                    late: "Deep body high, muscle relaxation, sleep aid."
                }
            })
        }
    ];

    for (const item of items) {
        const existing = await db.select().from(products).where(eq(products.name, item.name)).limit(1);
        if (existing.length > 0) {
            console.log(`Skipping ${item.name}, already exists.`);
            // Update it just in case metadata changed
            await db.update(products).set(item).where(eq(products.id, existing[0].id));
            console.log(`Updated ${item.name}.`);
        } else {
            await db.insert(products).values(item);
            console.log(`Inserted ${item.name}.`);
        }
    }

    console.log("Seeding complete.");
    process.exit(0);
}

seedCannabis().catch((e) => {
    console.error(e);
    process.exit(1);
});
