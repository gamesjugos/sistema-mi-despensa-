const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    try {
        const result = await prisma.$queryRaw`SELECT * FROM "Employee" LIMIT 5`;
        console.log(`Employees found:`, result.length);
        console.log(result);
    } catch (e) {
        console.error('Error connecting or querying:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
