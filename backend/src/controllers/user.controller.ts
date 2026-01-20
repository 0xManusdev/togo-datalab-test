import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import { UserService } from '@/services/user.service';
import { paginationSchema } from '@/utils/pagination';


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
            const user = await this.userService.create(req.body);
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

    public update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                res.status(400).json({ status: 'error', message: 'ID invalide' });
                return;
            }

            const user = await this.userService.update(id, req.body);
            res.json({ status: 'success', data: user });
        } catch (error) {
            next(error);
        }
    };
}
