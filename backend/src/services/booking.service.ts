import { prisma } from '../utils/prisma';
import { CreateBookingDTO } from '../dto/booking.schema';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../errors/AppError';

export class BookingService {
    
    /**
     * RÈGLE MÉTIER CRITIQUE : Vérification des chevauchements
     * Un véhicule ne peut pas avoir deux réservations confirmées sur des périodes qui se chevauchent
     */
    private async checkOverlap(vehicleId: string, startDate: Date, endDate: Date, excludeBookingId?: string): Promise<boolean> {
        const overlappingBooking = await prisma.booking.findFirst({
            where: {
                vehicleId,
                status: 'CONFIRMED',
                id: excludeBookingId ? { not: excludeBookingId } : undefined,
                // Condition de chevauchement : 
                // La nouvelle réservation commence avant la fin d'une existante
                // ET finit après le début d'une existante
                AND: [
                    { startDate: { lt: endDate } },
                    { endDate: { gt: startDate } }
                ]
            }
        });

        return !!overlappingBooking;
    }

    async findAll(userId: string, role: string) {
        // Les admins voient toutes les réservations
        // Les employés ne voient que les leurs
        const where = role === 'ADMIN' ? {} : { userId };
        
        return prisma.booking.findMany({
            where,
            include: {
                vehicle: true,
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            },
            orderBy: { startDate: 'desc' }
        });
    }

    async findById(id: string, userId: string, role: string) {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                vehicle: true,
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        });

        if (!booking) {
            throw new NotFoundError('Réservation non trouvée');
        }

        // Vérifier les droits d'accès
        if (role !== 'ADMIN' && booking.userId !== userId) {
            throw new UnauthorizedError('Vous ne pouvez pas accéder à cette réservation');
        }

        return booking;
    }

    async create(data: CreateBookingDTO, userId: string) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        // Vérifier que le véhicule existe et est disponible
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: data.vehicleId }
        });

        if (!vehicle) {
            throw new NotFoundError('Véhicule non trouvé');
        }

        if (!vehicle.isAvailable) {
            throw new ConflictError('Ce véhicule n\'est pas disponible à la réservation');
        }

        // 🔴 RÈGLE MÉTIER CRITIQUE : Vérifier les chevauchements
        const hasOverlap = await this.checkOverlap(data.vehicleId, startDate, endDate);
        
        if (hasOverlap) {
            throw new ConflictError(
                'Ce véhicule est déjà réservé sur cette période. Veuillez choisir d\'autres dates.'
            );
        }

        return prisma.booking.create({
            data: {
                vehicleId: data.vehicleId,
                userId,
                startDate,
                endDate,
                status: 'CONFIRMED'
            },
            include: {
                vehicle: true
            }
        });
    }

    async cancel(id: string, userId: string, role: string) {
        const booking = await this.findById(id, userId, role);

        if (booking.status === 'CANCELLED') {
            throw new AppError('Cette réservation est déjà annulée');
        }

        // Vérifier que la réservation n'est pas déjà passée
        if (new Date(booking.startDate) < new Date()) {
            throw new AppError('Impossible d\'annuler une réservation passée ou en cours');
        }

        return prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
            include: { vehicle: true }
        });
    }

    async getVehicleBookings(vehicleId: string) {
        return prisma.booking.findMany({
            where: {
                vehicleId,
                status: 'CONFIRMED',
                endDate: { gte: new Date() } // Seulement les réservations futures
            },
            orderBy: { startDate: 'asc' }
        });
    }
}