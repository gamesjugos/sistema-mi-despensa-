import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function init() {
    const count = await prisma.user.count();
    if (count === 0) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: 'admin@vikingos.com',
                password: hashedPassword,
                role: 'SUPERADMIN'
            }
        });
        console.log('✅ Admin user created (admin@vikingos.com / 123456)');
    } else {
        console.log('✅ Users already exist in DB');
    }
}

init().finally(() => prisma.$disconnect());
