import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const payment = await prisma.payment.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { registeredBy: true }
    });
    console.log(payment);
}

check().finally(() => prisma.$disconnect());
