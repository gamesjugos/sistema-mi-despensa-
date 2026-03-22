import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Config Global
export const getConfig = async (req: Request, res: Response) => {
    try {
        let config = await prisma.nominaConfig.findUnique({ where: { id: 'default' } });
        if (!config) {
            config = await prisma.nominaConfig.create({
                data: { id: 'default' }
            });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching nomina config' });
    }
};

export const updateConfig = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const config = await prisma.nominaConfig.upsert({
            where: { id: 'default' },
            create: { ...data, id: 'default' },
            update: data
        });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error updating nomina config' });
    }
};

// Records Mensuales
export const getRecordsByMonth = async (req: Request, res: Response) => {
    const { mes, anio } = req.query;
    try {
        const records = await prisma.nominaRecord.findMany({
            where: {
                mes: mes ? Number(mes) : new Date().getMonth() + 1,
                anio: anio ? Number(anio) : new Date().getFullYear(),
            },
            include: {
                employee: true
            }
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching records' });
    }
};

export const saveRecord = async (req: Request, res: Response) => {
    try {
        const { employeeId, mes, anio, ...data } = req.body;

        const record = await prisma.nominaRecord.upsert({
            where: {
                employeeId_mes_anio: {
                    employeeId,
                    mes: Number(mes),
                    anio: Number(anio)
                }
            },
            update: data,
            create: {
                ...data,
                employeeId,
                mes: Number(mes),
                anio: Number(anio)
            },
            include: { employee: true }
        });

        res.json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving record' });
    }
};
