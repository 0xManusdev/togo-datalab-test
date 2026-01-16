import { AuthRequest } from '@/middleware/auth.middleware';
import { VehicleService } from '@/services/vehicle.service';
import { availableVehiclesQuerySchema } from '@/dto/vehicle.schema';
import { Response, NextFunction } from 'express';


export class VehicleController {
    private vehicleService: VehicleService;

    constructor() {
        this.vehicleService = new VehicleService();
    }

    public findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const vehicles = await this.vehicleService.findAll();
            res.json({ status: 'success', data: vehicles });
        } catch (error) {
            next(error);
        }
    };

    public findAvailable = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = availableVehiclesQuerySchema.safeParse(req.query);

            if (!result.success) {
                res.status(400).json({
                    status: 'error',
                    message: 'Paramètres invalides',
                    errors: result.error.flatten().fieldErrors
                });
                return;
            }

            const { startDate, endDate } = result.data;
            const vehicles = await this.vehicleService.findAvailable(
                new Date(startDate),
                new Date(endDate)
            );
            res.json({ status: 'success', data: vehicles });
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
            const vehicle = await this.vehicleService.findById(id);
            res.json({ status: 'success', data: vehicle });
        } catch (error) {
            next(error);
        }
    };

    public create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const vehicle = await this.vehicleService.create(req.body);
            res.status(201).json({ status: 'success', data: vehicle });
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
            const vehicle = await this.vehicleService.update(id, req.body);
            res.json({ status: 'success', data: vehicle });
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
            await this.vehicleService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}