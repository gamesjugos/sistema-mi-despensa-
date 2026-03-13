import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Generic Zod validation middleware factory.
 * ISO 25010 - Reliability: ensures only valid data reaches the database.
 */
export const validate = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos.',
                errors,
            });
        }
        req.body = result.data; // use parsed (sanitized) data
        next();
    };
};

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email('Correo electrónico inválido.'),
    password: z.string().min(1, 'La contraseña es requerida.'),
});

export const createPlayerSchema = z.object({
    firstName: z.string().min(1, 'El nombre es requerido.').max(100),
    lastName: z.string().min(1, 'El apellido es requerido.').max(100),
    cedula: z.string().min(1, 'La cédula es requerida.').max(20),
    repCedula: z.string().max(20).optional(),
    position: z.enum(['Piloto', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot']).optional(),
    dateOfBirth: z.string().optional(),
    height: z.number().positive().optional().nullable(),
    shoeSize: z.string().max(10).optional(),
    shirtSize: z.string().max(10).optional(),
    stride: z.string().max(20).optional(),
    jumpLongevity: z.string().max(30).optional(),
    photoUrl: z.string().optional(),
});

export const createPaymentSchema = z.object({
    playerId: z.string().uuid('ID de jugador inválido.'),
    amount: z.union([z.number().positive(), z.string()]).transform(v => parseFloat(String(v))),
    paymentDate: z.string().min(1, 'La fecha de pago es requerida.'),
    month: z.union([z.number().int().min(1).max(12), z.string()]).transform(v => parseInt(String(v), 10)),
    year: z.union([z.number().int().min(2020).max(2100), z.string()]).transform(v => parseInt(String(v), 10)),
    receiptNumber: z.string().max(100).optional(),
    receiptImage: z.string().optional(),
});

export const createAdminSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
    email: z.string().email('Correo electrónico inválido.'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    role: z.enum(['ADMIN', 'SUPERADMIN']).default('ADMIN'),
});
