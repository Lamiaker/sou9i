const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.findMany({
            where: { isBanned: true },
            select: { email: true, isBanned: true, banReason: true }
        });
        console.log('BANNED USERS:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('DATABASE ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
