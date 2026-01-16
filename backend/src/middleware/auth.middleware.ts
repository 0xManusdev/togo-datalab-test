import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@/errors/AppError';
import { config } from '@/config/environment';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: 'EMPLOYEE' | 'ADMIN';
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token manquant');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: 'EMPLOYEE' | 'ADMIN' };

        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Token invalide'));
        } else {
            next(error);
        }
    }
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'ADMIN') {
        next(new UnauthorizedError('Accès réservé aux administrateurs'));
        return;
    }
    next();
};