import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const players = await prisma.player.findMany({
        take: 1,
        include: {
            payments: {
                orderBy: { paymentDate: 'desc' },
                include: { registeredBy: { select: { id: true, name: true, role: true } } }
            }
        }
    });
    console.log(JSON.stringify(players, null, 2));
}

check().finally(() => prisma.$disconnect());
