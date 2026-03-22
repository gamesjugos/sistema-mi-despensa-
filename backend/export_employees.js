const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
    try {
        const result = await prisma.$queryRaw`SELECT * FROM "Employee"`;
        console.log(`Employees isolated for backup:`, result.length);
        fs.writeFileSync('employees_backup.json', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

exportData();
