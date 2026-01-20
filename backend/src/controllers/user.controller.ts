import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import { UserService } from '@/services/user.service';
import { registerSchema } from '@/dto/auth.schema';
import { paginationSchema } from '@/utils/pagination';
import { z } from 'zod';

const createUserSchema = registerSchema.extend({
    role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
});

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const paginationResult = paginationSchema.safeParse(req.query);
            const { page, limit } = paginationResult.success
                ? paginationResult.data
                : { page: 1, limit: 20 };

            const result = await this.userService.findAll(page, limit);
            res.json({ status: 'success', ...result });
        } catch (error) {
            next(error);
        }
    };

    public findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                res.status(400).json({ status: 'error', message: 'ID invalide' });
                return;
            }
            const user = await this.userService.findById(id);
            res.json({ status: 'success', data: user });
        } catch (error) {
            next(error);
        }
    };

    public create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const validationResult = createUserSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    status: 'error',
                    message: 'Données invalides',
                    errors: validationResult.error.flatten().fieldErrors
                });
                return;
            }

            const user = await this.userService.create(validationResult.data);
            res.status(201).json({ status: 'success', data: user });
        } catch (error) {
            next(error);
        }
    };

    public delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                res.status(400).json({ status: 'error', message: 'ID invalide' });
                return;
            }
            
            if (req.user?.userId === id) {
                res.status(400).json({
                    status: 'error',
                    message: 'Vous ne pouvez pas supprimer votre propre compte'
                });
                return;
            }

            await this.userService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}
