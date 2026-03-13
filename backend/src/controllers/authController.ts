import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (!user.isActive) return res.status(403).json({ message: 'Usuario inactivo. Contacta al superadmin.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Credenciales inválidas' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== ADMIN CRUD ====================

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // Never expose password
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching admins' });
    }
};

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son obligatorios.' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese correo.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'ADMIN',
            },
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        });

        res.status(201).json({ success: true, data: newAdmin });
    } catch (error: any) {
        console.error('CREATE ADMIN ERROR:', error);
        res.status(500).json({ success: false, message: error.message || 'Error al crear admin' });
    }
};

export const updateAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, isActive } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedAdmin = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        });

        res.json({ success: true, data: updatedAdmin });
    } catch (error: any) {
        console.error('UPDATE ADMIN ERROR:', error);
        if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Admin no encontrado.' });
        if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'El correo ya está en uso.' });
        res.status(500).json({ success: false, message: error.message || 'Error al actualizar admin' });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ success: true, message: 'Administrador eliminado correctamente.' });
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Admin no encontrado.' });
        res.status(500).json({ success: false, message: 'Error al eliminar admin' });
    }
};

export const toggleAdminStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const admin = await prisma.user.findUnique({ where: { id } });
        if (!admin) return res.status(404).json({ success: false, message: 'Admin no encontrado.' });

        const updated = await prisma.user.update({
            where: { id },
            data: { isActive: !admin.isActive },
            select: { id: true, name: true, email: true, role: true, isActive: true },
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cambiar estado' });
    }
};
