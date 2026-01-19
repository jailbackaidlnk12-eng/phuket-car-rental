/**
 * Seed script for Mirin Motorcycle Rental
 * Adds sample motorcycles and admin account for demo purposes
 */
import bcrypt from "bcrypt";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { users, products } from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL || "./data/mirin.db";
const sqlite = new Database(DATABASE_URL);
const db = drizzle(sqlite);

async function seed() {
    console.log("🌱 Seeding database...");

    // Create admin account
    const adminPassword = await bcrypt.hash("admin123", 10);
    const existingAdmin = db.select().from(users).where((fields: any) => fields.username.equals?.("admin")).get();

    if (!existingAdmin) {
        db.insert(users).values({
            username: "admin",
            passwordHash: adminPassword,
            name: "Admin User",
            email: "admin@mirin-rental.local",
            role: "admin",
            balance: 0,
        }).run();
        console.log("✅ Created admin account (admin / admin123)");
    } else {
        console.log("ℹ️ Admin account already exists");
    }

    // Create demo user account
    const demoPassword = await bcrypt.hash("demo123", 10);
    const existingDemo = db.select().from(users).where((fields: any) => fields.username.equals?.("demo")).get();

    if (!existingDemo) {
        db.insert(users).values({
            username: "demo",
            passwordHash: demoPassword,
            name: "Demo User",
            email: "demo@example.com",
            role: "user",
            balance: 500,
        }).run();
        console.log("✅ Created demo account (demo / demo123)");
    } else {
        console.log("ℹ️ Demo account already exists");
    }

    // Sample products (Motorcycles)
    const sampleProducts = [
        {
            name: "Honda Click 125i",
            category: "motorcycle" as const,
            licensePlate: "ABC-1234",
            hourlyRate: 50,
            dailyRate: 300,
            description: "Popular automatic scooter, easy to ride. Perfect for city exploring.",
            imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
            status: "available" as const,
            metadata: { type: "scooter", brand: "Honda", model: "Click 125i" },
        },
        {
            name: "Honda PCX 160",
            category: "motorcycle" as const,
            licensePlate: "DEF-5678",
            hourlyRate: 80,
            dailyRate: 500,
            description: "Premium scooter with ABS and LED lights. Comfortable for long rides.",
            imageUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400",
            status: "available" as const,
            metadata: { type: "scooter", brand: "Honda", model: "PCX 160" },
        },
        {
            name: "Yamaha NMAX 155",
            category: "motorcycle" as const,
            licensePlate: "GHI-9012",
            hourlyRate: 75,
            dailyRate: 450,
            description: "Sporty scooter with VVA technology. Great fuel efficiency.",
            imageUrl: "https://images.unsplash.com/photo-1568772585407-9361bd075917?w=400",
            status: "available" as const,
            metadata: { type: "scooter", brand: "Yamaha", model: "NMAX 155" },
        },
        {
            name: "Honda Wave 110i",
            category: "motorcycle" as const,
            licensePlate: "JKL-3456",
            hourlyRate: 35,
            dailyRate: 200,
            description: "Budget-friendly semi-automatic. Very economical on fuel.",
            imageUrl: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400",
            status: "available" as const,
            metadata: { type: "scooter", brand: "Honda", model: "Wave 110i" },
        },
        {
            name: "Kawasaki Ninja 400",
            category: "motorcycle" as const,
            licensePlate: "MNO-7890",
            hourlyRate: 200,
            dailyRate: 1200,
            description: "Sport bike for experienced riders. Requires big bike license.",
            imageUrl: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400",
            status: "available" as const,
            metadata: { type: "bigbike", brand: "Kawasaki", model: "Ninja 400" },
        },
        {
            name: "Honda Rebel 500",
            category: "motorcycle" as const,
            licensePlate: "PQR-1357",
            hourlyRate: 180,
            dailyRate: 1000,
            description: "Cruiser style, comfortable riding position. Great for coastal roads.",
            imageUrl: "https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400",
            status: "available" as const,
            metadata: { type: "bigbike", brand: "Honda", model: "Rebel 500" },
        },
        {
            name: "Vespa Primavera 150",
            category: "motorcycle" as const,
            licensePlate: "STU-2468",
            hourlyRate: 100,
            dailyRate: 600,
            description: "Classic Italian design. Instagram-worthy rides around Old Town.",
            imageUrl: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400",
            status: "available" as const,
            metadata: { type: "scooter", brand: "Vespa", model: "Primavera 150" },
        },
        {
            name: "Yamaha Aerox 155",
            category: "motorcycle" as const,
            licensePlate: "VWX-3579",
            hourlyRate: 70,
            dailyRate: 400,
            description: "Sporty scooter with aggressive styling. Popular with young riders.",
            imageUrl: "https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=400",
            status: "maintenance" as const,
            metadata: { type: "scooter", brand: "Yamaha", model: "Aerox 155" },
        },
    ];

    // Check if products exist
    const existingProducts = db.select().from(products).all();

    if (existingProducts.length === 0) {
        for (const product of sampleProducts) {
            db.insert(products).values(product).run();
        }
        console.log(`✅ Added ${sampleProducts.length} sample products`);
    } else {
        console.log(`ℹ️ ${existingProducts.length} products already exist`);
    }

    console.log("🎉 Seeding complete!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
