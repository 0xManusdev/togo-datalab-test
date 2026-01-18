import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const uuidSchema = z.string().uuid('ID invalide : format UUID attendu');

export const validateUuidParam = (paramName: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const paramValue = req.params[paramName];

        const result = uuidSchema.safeParse(paramValue);

        if (!result.success) {
            res.status(400).json({
                status: 'error',
                message: `Paramètre '${paramName}' invalide`,
                errors: result.error.flatten().formErrors,
            });
            return;
        }

        next();
    };
};

export const validateUuidParams = (...paramNames: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        for (const paramName of paramNames) {
            const paramValue = req.params[paramName];
            const result = uuidSchema.safeParse(paramValue);

            if (!result.success) {
                res.status(400).json({
                    status: 'error',
                    message: `Paramètre '${paramName}' invalide`,
                    errors: result.error.flatten().formErrors,
                });
                return;
            }
        }

        next();
    };
};
