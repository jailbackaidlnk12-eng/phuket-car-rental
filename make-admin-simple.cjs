/**
 * ทำให้ user เป็น admin ด้วย SQL โดยตรง
 * Usage: node make-admin-simple.cjs
 * หรือ: node make-admin-simple.cjs <username>
 */

const Database = require('better-sqlite3');
const dbPath = './data/sqlite.db';

try {
    const db = new Database(dbPath);

    const username = process.argv[2];

    console.log('🔧 Mirin Admin Tool\n');

    // Show all users first
    const allUsers = db.prepare('SELECT id, username, name, role FROM users').all();

    if (allUsers.length === 0) {
        console.log('❌ ยังไม่มีผู้ใช้ในระบบ');
        console.log('💡 ไปสมัครสมาชิกที่ http://localhost:3000/register ก่อน\n');
        db.close();
        process.exit(0);
    }

    console.log('📋 ผู้ใช้ทั้งหมดในระบบ:');
    allUsers.forEach((u, i) => {
        const roleEmoji = u.role === 'admin' ? '👑' : '👤';
        const num = (i + 1).toString().padStart(2, ' ');
        console.log(`  ${num}. ${roleEmoji} ${u.username} (${u.name || 'ไม่ระบุชื่อ'}) - Role: ${u.role}`);
    });
    console.log('');

    if (!username) {
        console.log('💡 วิธีใช้: node make-admin-simple.cjs <username>');
        console.log(`   ตัวอย่าง: node make-admin-simple.cjs ${allUsers[0].username}\n`);
        db.close();
        process.exit(0);
    }

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
        console.log(`❌ ไม่พบผู้ใช้ "${username}"\n`);
        db.close();
        process.exit(1);
    }

    if (user.role === 'admin') {
        console.log(`ℹ️  ผู้ใช้ "${username}" เป็น admin อยู่แล้ว\n`);
        db.close();
        process.exit(0);
    }

    // Make user admin
    const stmt = db.prepare('UPDATE users SET role = ? WHERE username = ?');
    const result = stmt.run('admin', username);

    if (result.changes > 0) {
        console.log(`✅ สำเร็จ! ผู้ใช้ "${username}" เป็น admin แล้ว\n`);

        const updatedUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        console.log('📋 ข้อมูลผู้ใช้:');
        console.log(`  👑 Username: ${updatedUser.username}`);
        console.log(`  📛 Name: ${updatedUser.name || '-'}`);
        console.log(`  🎭 Role: ${updatedUser.role}`);
        console.log(`  💰 Balance: ฿${updatedUser.balance}`);
        console.log('\n🎉 ตอนนี้ login แล้วจะถูกนำไปหน้า /admin อัตโนมัติ!\n');
    }

    db.close();
} catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    if (error.message.includes('no such table')) {
        console.log('\n💡 ดูเหมือนว่าฐานข้อมูลยังไม่ได้ถูกสร้าง');
        console.log('   ลอง run: npx drizzle-kit push\n');
    }
    process.exit(1);
}
