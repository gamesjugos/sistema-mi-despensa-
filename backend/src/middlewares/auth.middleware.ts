import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string; role: string };
}

/**
 * Middleware to verify JWT tokens on protected routes.
 * ISO 27001 - Access Control: ensures only authenticated users access resources.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; role: string };
        req.user = decoded;
        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' });
        }
        return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
};

/**
 * Middleware to restrict access to SUPERADMIN role.
 * ISO 27001 - Privilege Management.
 */
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'SUPERADMIN') {
        return res.status(403).json({ success: false, message: 'Acceso restringido: Se requiere rol SUPERADMIN.' });
    }
    next();
};
