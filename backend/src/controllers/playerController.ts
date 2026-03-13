import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlayers = async (req: Request, res: Response) => {
    try {
        const { search, state, limit, page } = req.query;

        // Pagination defaults
        const take = limit ? Number(limit) : 10;
        const skip = page ? (Number(page) - 1) * take : 0;

        // Filters setup
        const where: any = {};
        if (search) {
            where.OR = [
                { firstName: { contains: String(search), mode: 'insensitive' } },
                { lastName: { contains: String(search), mode: 'insensitive' } },
                { cedula: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        if (state !== undefined) {
            where.isActive = state === 'true';
        }

        const [players, total] = await Promise.all([
            prisma.player.findMany({
                where,
                take,
                skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    payments: {
                        orderBy: { paymentDate: 'desc' },
                        include: { registeredBy: { select: { id: true, name: true, role: true } } }
                    }
                }
            }),
            prisma.player.count({ where })
        ]);

        // Format if they are "Al día"
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const formattedPlayers = players.map(p => {
            const lastPayment = p.payments[0];
            const hasPaidCurrentMonth = lastPayment ? (lastPayment.month === currentMonth && lastPayment.year === currentYear) : false;
            return {
                ...p,
                hasPaidCurrentMonth
            };
        });

        res.json({
            data: formattedPlayers,
            meta: {
                total,
                page: page ? Number(page) : 1,
                limit: take,
                totalPages: Math.ceil(total / take)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPlayerById = async (req: Request, res: Response) => {
    try {
        const player = await prisma.player.findUnique({
            where: { id: req.params.id },
            include: {
                payments: {
                    orderBy: { paymentDate: 'desc' },
                    include: { registeredBy: { select: { id: true, name: true, role: true } } }
                }
            }
        });
        if (!player) return res.status(404).json({ message: 'Player not found' });
        res.json(player);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const createPlayer = async (req: Request, res: Response) => {
    try {
        const {
            firstName, lastName, cedula, repCedula,
            dateOfBirth, position,
            shoeSize, shirtSize, stride, jumpLongevity,
            height, photoUrl
        } = req.body;

        const createData: any = { firstName, lastName, cedula };
        if (repCedula !== undefined) createData.repCedula = repCedula;
        if (position !== undefined) createData.position = position;
        if (shoeSize !== undefined) createData.shoeSize = shoeSize;
        if (shirtSize !== undefined) createData.shirtSize = shirtSize;
        if (stride !== undefined) createData.stride = stride;
        if (jumpLongevity !== undefined) createData.jumpLongevity = jumpLongevity;
        if (height !== undefined) createData.height = height ? parseFloat(String(height)) : null;
        if (photoUrl !== undefined) createData.photoUrl = photoUrl;
        if (dateOfBirth !== undefined) createData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;

        const newPlayer = await prisma.player.create({ data: createData });
        res.status(201).json(newPlayer);
    } catch (error: any) {
        console.error("CREATE PLAYER ERROR:", error);
        if (error.code === 'P2002') return res.status(400).json({ message: 'Cedula ya registrada' });
        res.status(500).json({ message: error.message || 'Server error', error });
    }
};

export const updatePlayer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            firstName, lastName, cedula, repCedula,
            dateOfBirth, position,
            shoeSize, shirtSize, stride, jumpLongevity,
            height, photoUrl, isActive
        } = req.body;

        // Build a clean update object with only the fields that were sent
        const updateData: any = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (cedula !== undefined) updateData.cedula = cedula;
        if (repCedula !== undefined) updateData.repCedula = repCedula;
        if (position !== undefined) updateData.position = position;
        if (shoeSize !== undefined) updateData.shoeSize = shoeSize;
        if (shirtSize !== undefined) updateData.shirtSize = shirtSize;
        if (stride !== undefined) updateData.stride = stride;
        if (jumpLongevity !== undefined) updateData.jumpLongevity = jumpLongevity;
        if (height !== undefined) updateData.height = height ? parseFloat(String(height)) : null;
        if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
        if (isActive !== undefined) updateData.isActive = isActive;

        // Convert dateOfBirth string to Date object for Prisma
        if (dateOfBirth !== undefined) {
            updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
        }

        const updatedPlayer = await prisma.player.update({
            where: { id },
            data: updateData,
            include: {
                payments: {
                    orderBy: { paymentDate: 'desc' },
                    include: { registeredBy: { select: { id: true, name: true, role: true } } }
                }
            }
        });
        res.json(updatedPlayer);
    } catch (error: any) {
        console.error('UPDATE PLAYER ERROR:', error);
        if (error.code === 'P2002') return res.status(400).json({ message: 'Cédula ya registrada por otro jugador.' });
        res.status(500).json({ message: error.message || 'Server error', error });
    }
};

export const deletePlayer = async (req: Request, res: Response) => {
    try {
        await prisma.player.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Player deleted correctly' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
