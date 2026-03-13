import app from './app';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// ─── Graceful Shutdown (ISO 25010 - Reliability) ─────────────────────────────
const shutdown = async (signal: string) => {
    console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`);
    await prisma.$disconnect();
    console.log('[SERVER] Prisma disconnected. Goodbye.');
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Unhandled Rejection Safety Net ──────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
    console.error('[SERVER] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[SERVER] Uncaught Exception:', err);
    process.exit(1);
});

// ─── Start ────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`[SERVER] ✅ Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

export default server;
