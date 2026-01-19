/**
 * Script to make a user an admin
 * Usage: node make-admin.cjs <username>
 * Example: node make-admin.cjs youruser
 */

const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const { users } = require('./drizzle/schema');
const { eq } = require('drizzle-orm');

const dbPath = './data/sqlite.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

const username = process.argv[2];

console.log('🔧 Mirin Admin Tool\n');

if (!username) {
    console.log('📋 ผู้ใช้ทั้งหมดในระบบ:');
    const allUsers = db.select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role
    }).from(users).all();

    if (allUsers.length === 0) {
        console.log('  ❌ ยังไม่มีผู้ใช้ในระบบ');
        console.log('  💡 ไปสมัครสมาชิกที่ http://localhost:3000/register ก่อน\n');
    } else {
        allUsers.forEach(u => {
            const roleEmoji = u.role === 'admin' ? '👑' : '👤';
            console.log(`  ${roleEmoji} ${u.username} (${u.name || 'ไม่ระบุชื่อ'}) - ${u.role}`);
        });
        console.log('\n💡 วิธีใช้: node make-admin.cjs <username>');
        console.log('   ตัวอย่าง: node make-admin.cjs ' + allUsers[0].username + '\n');
    }
    sqlite.close();
    process.exit(0);
}

try {
    // Update user role to admin
    const result = db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.username, username))
        .run();

    if (result.changes > 0) {
        console.log(`✅ สำเร็จ! ผู้ใช้ "${username}" เป็น admin แล้ว\n`);

        // Show updated user
        const user = db.select().from(users).where(eq(users.username, username)).get();
        console.log('📋 ข้อมูลผู้ใช้:');
        console.log(`  👑 Username: ${user.username}`);
        console.log(`  📛 Name: ${user.name || '-'}`);
        console.log(`  🎭 Role: ${user.role}`);
        console.log(`  💰 Balance: ฿${user.balance}`);
        console.log('\n🎉 ตอนนี้สามารถ login แล้วจะถูกนำไปหน้า /admin อัตโนมัติ!\n');
    } else {
        console.log(`❌ ไม่พบผู้ใช้ "${username}"\n`);

        // Show all users
        console.log('📋 ผู้ใช้ทั้งหมดในระบบ:');
        const allUsers = db.select({
            username: users.username,
            name: users.name,
            role: users.role
        }).from(users).all();

        if (allUsers.length === 0) {
            console.log('  (ยังไม่มีผู้ใช้ในระบบ)\n');
        } else {
            allUsers.forEach(u => {
                const roleEmoji = u.role === 'admin' ? '👑' : '👤';
                console.log(`  ${roleEmoji} ${u.username} (${u.name || 'ไม่ระบุชื่อ'}) - ${u.role}`);
            });
            console.log('');
        }
    }
} catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.error(error);
    process.exit(1);
} finally {
    sqlite.close();
}
