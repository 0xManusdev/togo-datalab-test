import { AuthRequest } from '@/middleware/auth.middleware';
import { VehicleService } from '@/services/vehicle.service';
import { UploadService } from '@/services/upload.service';
import { availableVehiclesQuerySchema, createVehicleSchema, updateVehicleSchema } from '@/dto/vehicle.schema';
import { paginationSchema } from '@/utils/pagination';
import { Response, NextFunction } from 'express';


export class VehicleController {
    private vehicleService: VehicleService;
    private uploadService: UploadService;

    constructor() {
        this.vehicleService = new VehicleService();
        this.uploadService = new UploadService();
    }

    public findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const paginationResult = paginationSchema.safeParse(req.query);
            const { page, limit } = paginationResult.success 
                ? paginationResult.data 
                : { page: 1, limit: 20 };

            const result = await this.vehicleService.findAll(page, limit);
            res.json({ status: 'success', ...result });
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
            const validationResult = createVehicleSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    status: 'error',
                    message: 'Données invalides',
                    errors: validationResult.error.flatten().fieldErrors
                });
                return;
            }

            let imageUrl: string | undefined;
            if (req.file) {
                imageUrl = await this.uploadService.uploadVehicleImage(req.file);
            }

            const vehicle = await this.vehicleService.create({
                ...validationResult.data,
                imageUrl,
            });
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

            const validationResult = updateVehicleSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    status: 'error',
                    message: 'Données invalides',
                    errors: validationResult.error.flatten().fieldErrors
                });
                return;
            }

            let imageUrl: string | undefined;
            if (req.file) {
                const existingVehicle = await this.vehicleService.findById(id);
                if (existingVehicle.imageUrl) {
                    await this.uploadService.deleteVehicleImage(existingVehicle.imageUrl);
                }
                imageUrl = await this.uploadService.uploadVehicleImage(req.file);
            }

            const vehicle = await this.vehicleService.update(id, {
                ...validationResult.data,
                ...(imageUrl && { imageUrl }),
            });
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
            
            const vehicle = await this.vehicleService.findById(id);
            if (vehicle.imageUrl) {
                await this.uploadService.deleteVehicleImage(vehicle.imageUrl);
            }
            
            await this.vehicleService.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}