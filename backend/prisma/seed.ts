import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('midespensa123', 10);

    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@midespensa.com' },
        update: {},
        create: {
            email: 'admin@midespensa.com',
            name: 'Super Admin Mi Despensa',
            password: hashedPassword,
            role: 'SUPERADMIN',
        },
    });

    console.log('Seed executed. Created SuperAdmin:');
    console.log(superAdmin);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
