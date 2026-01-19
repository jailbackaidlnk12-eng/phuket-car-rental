/**
 * Script to make a user an admin
 * Usage: node make-admin.js <username>
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { users } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const dbPath = './data/sqlite.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

const username = process.argv[2];

if (!username) {
    console.error('❌ กรุณาระบุ username');
    console.log('Usage: node make-admin.js <username>');
    process.exit(1);
}

try {
    // Update user role to admin
    const result = db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.username, username))
        .run();

    if (result.changes > 0) {
        console.log(`✅ สำเร็จ! ผู้ใช้ "${username}" เป็น admin แล้ว`);

        // Show updated user
        const user = db.select().from(users).where(eq(users.username, username)).get();
        console.log('\n📋 ข้อมูลผู้ใช้:');
        console.log(`  - ID: ${user.id}`);
        console.log(`  - Username: ${user.username}`);
        console.log(`  - Name: ${user.name || '-'}`);
        console.log(`  - Role: ${user.role}`);
        console.log(`  - Balance: ฿${user.balance}`);
    } else {
        console.log(`❌ ไม่พบผู้ใช้ "${username}"`);

        // Show all users
        console.log('\n📋 ผู้ใช้ทั้งหมดในระบบ:');
        const allUsers = db.select({
            id: users.id,
            username: users.username,
            name: users.name,
            role: users.role
        }).from(users).all();

        if (allUsers.length === 0) {
            console.log('  (ยังไม่มีผู้ใช้ในระบบ - ไปสมัครที่ /register ก่อน)');
        } else {
            allUsers.forEach(u => {
                console.log(`  - ${u.username} (${u.name || 'ไม่ระบุชื่อ'}) - Role: ${u.role}`);
            });
        }
    }
} catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
} finally {
    sqlite.close();
}
