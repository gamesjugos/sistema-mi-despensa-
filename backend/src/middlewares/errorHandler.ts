import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    status?: number;
    code?: string;
}

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
    // Log full error in non-production (ISO 25010 - Maintainability)
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
        if (err.stack) console.error(err.stack);
    } else {
        // In production log minimal info (ISO 27001 - don't expose internals)
        console.error(`[ERROR] ${req.method} ${req.path} - ${err.message}`);
    }

    // Handle known Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({ success: false, message: 'Ya existe un registro con ese valor único.' });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Recurso no encontrado.' });
    }

    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ success: false, message: 'Origen no permitido.' });
    }

    const status = err.status || 500;
    const message = status === 500 && process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor.' // Don't expose internal errors in production
        : err.message || 'Error interno del servidor.';

    res.status(status).json({ success: false, message });
};
