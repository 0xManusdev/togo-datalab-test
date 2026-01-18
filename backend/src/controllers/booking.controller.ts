import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { paginationSchema } from '../utils/pagination';

export class BookingController {
    private bookingService: BookingService;

    constructor() {
        this.bookingService = new BookingService();
    }

    public findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const paginationResult = paginationSchema.safeParse(req.query);
            const { page, limit } = paginationResult.success 
                ? paginationResult.data 
                : { page: 1, limit: 20 };

            const result = await this.bookingService.findAll(
                req.user!.userId,
                req.user!.role,
                page,
                limit
            );
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
            const booking = await this.bookingService.findById(
                id,
                req.user!.userId,
                req.user!.role
            );
            res.json({ status: 'success', data: booking });
        } catch (error) {
            next(error);
        }
    };

    public create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const booking = await this.bookingService.create(req.body, req.user!.userId);
            res.status(201).json({
                status: 'success',
                message: 'Réservation créée avec succès',
                data: booking
            });
        } catch (error) {
            next(error);
        }
    };

    public cancel = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                res.status(400).json({ status: 'error', message: 'ID invalide' });
                return;
            }
            const booking = await this.bookingService.cancel(
                id,
                req.user!.userId,
                req.user!.role
            );
            res.json({
                status: 'success',
                message: 'Réservation annulée',
                data: booking
            });
        } catch (error) {
            next(error);
        }
    };

    public getVehicleBookings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { vehicleId } = req.params;
            if (typeof vehicleId !== 'string') {
                res.status(400).json({ status: 'error', message: 'ID véhicule invalide' });
                return;
            }
            const bookings = await this.bookingService.getVehicleBookings(vehicleId);
            res.json({ status: 'success', data: bookings });
        } catch (error) {
            next(error);
        }
    };
}