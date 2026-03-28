const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.nominaConfig.findFirst().then(console.log).finally(() => prisma.$disconnect());
