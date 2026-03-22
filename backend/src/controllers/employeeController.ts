import { Request, Response } from 'express';
import { PrismaClient, Empresa } from '@prisma/client';

const prisma = new PrismaClient();

export const getEmployees = async (req: Request, res: Response) => {
    try {
        const empresa = req.query.empresa as Empresa | undefined;
        const whereClause = empresa ? { empresa } : {};
        
        const employees = await prisma.employee.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, count: employees.length, data: employees });
    } catch (error: any) {
        console.error('GET_EMPLOYEES_ERROR', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getEmployeeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({ where: { id } });
        if (!employee) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
        
        res.json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const { nombre, apellido, cargo, fechaIngreso, fechaEgreso, empresa, cedula, sueldoMensual } = req.body;
        
        if (!nombre || !apellido || !cargo || !fechaIngreso || !cedula) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
        }

        const employee = await prisma.employee.create({
            data: {
                nombre,
                apellido,
                cargo,
                cedula,
                sueldoMensual: sueldoMensual ? Number(sueldoMensual) : 0,
                fechaIngreso: new Date(fechaIngreso),
                fechaEgreso: fechaEgreso ? new Date(fechaEgreso) : null,
                empresa: empresa || 'MI_DESPENSA'
            }
        });
        
        res.status(201).json({ success: true, data: employee });
    } catch (error: any) {
        console.error('CREATE_EMPLOYEE_ERROR:', error);
        res.status(500).json({ success: false, message: 'No se pudo crear el empleado' });
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, cargo, fechaIngreso, fechaEgreso, empresa, isActive, cedula, sueldoMensual } = req.body;

        const dataToUpdate: any = {};
        if (nombre) dataToUpdate.nombre = nombre;
        if (apellido) dataToUpdate.apellido = apellido;
        if (cedula !== undefined) dataToUpdate.cedula = cedula;
        if (sueldoMensual !== undefined) dataToUpdate.sueldoMensual = Number(sueldoMensual);
        if (cargo) dataToUpdate.cargo = cargo;
        if (fechaIngreso) dataToUpdate.fechaIngreso = new Date(fechaIngreso);
        if (fechaEgreso !== undefined) dataToUpdate.fechaEgreso = fechaEgreso ? new Date(fechaEgreso) : null;
        if (empresa) dataToUpdate.empresa = empresa;
        if (isActive !== undefined) dataToUpdate.isActive = isActive;

        const updated = await prisma.employee.update({
            where: { id },
            data: dataToUpdate
        });

        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error actualizando empleado' });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.employee.delete({ where: { id } });
        res.json({ success: true, message: 'Empleado eliminado' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error eliminando empleado' });
    }
};
