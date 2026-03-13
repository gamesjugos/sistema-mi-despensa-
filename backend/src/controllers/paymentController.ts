import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPaymentStats = async (req: Request, res: Response) => {
    try {
        const totalPayments = await prisma.payment.count();
        const activePlayersCount = await prisma.player.count({
            where: { isActive: true },
        });

        // To calculate pending payments for the current month:
        // 1. Get current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        const currentYear = currentDate.getFullYear();

        // 2. Count how many active players have paid this current month
        const paymentsThisMonth = await prisma.payment.count({
            where: {
                month: currentMonth,
                year: currentYear,
                player: { isActive: true },
            },
            // Ensure distinct players in case a single player mistakenly has multiple
            // although our unique constraint prevents that now.
        });

        // 3. Pending = active players - players who paid
        const pendingPayments = Math.max(0, activePlayersCount - paymentsThisMonth);

        res.json({
            success: true,
            data: {
                totalPayments,
                activePlayersCount,
                pendingPayments,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching stats', error });
    }
};

export const getPayments = async (req: Request, res: Response) => {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                player: true,
                registeredBy: { select: { id: true, name: true, role: true } }
            },
            orderBy: { paymentDate: 'desc' }
        });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

export const createPayment = async (req: Request, res: Response) => {
    try {
        const { amount, paymentDate, month, year, playerId, receiptImage, receiptNumber } = req.body;

        if (!playerId || !amount || !paymentDate || !month || !year) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: jugador, monto, fecha, mes y año.' });
        }

        const monthNum = parseInt(String(month), 10);
        const yearNum = parseInt(String(year), 10);

        // Check if payment already exists
        const existingPayment = await prisma.payment.findUnique({
            where: {
                playerId_month_year: {
                    playerId,
                    month: monthNum,
                    year: yearNum
                }
            }
        });

        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Este jugador ya tiene un pago registrado para este mes y año.'
            });
        }

        const newPayment = await prisma.payment.create({
            data: {
                amount: parseFloat(String(amount)),
                paymentDate: new Date(paymentDate),
                month: monthNum,
                year: yearNum,
                playerId,
                receiptImage: receiptImage || null,
                receiptNumber: receiptNumber || null,
                registeredById: (req as any).user?.id || null,
            }
        });
        res.status(201).json({ success: true, data: newPayment });
    } catch (error: any) {
        console.error('CREATE PAYMENT ERROR:', error);
        res.status(500).json({ success: false, message: error.message || 'Error al registrar pago' });
    }
};

export const deletePayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.payment.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Pago eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar pago', error });
    }
};
