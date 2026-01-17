import { prisma } from '../utils/prisma';
import { CreateBookingDTO } from '../dto/booking.schema';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../errors/AppError';
import { Vehicle } from '../generated/prisma/client';

export class BookingService {
    private validateDates(startDate: Date, endDate: Date): void {
        const now = new Date();

        if (startDate >= endDate) {
            throw new AppError('La date de fin doit être après la date de début', 400);
        }

        if (startDate < now) {
            throw new AppError('Impossible de créer une réservation dans le passé', 400);
        }
    }

    private async checkOverlapInTransaction(
        tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
        vehicleId: string,
        startDate: Date,
        endDate: Date,
        excludeBookingId?: string
    ): Promise<boolean> {
        const overlappingBooking = await tx.booking.findFirst({
            where: {
                vehicleId,
                status: 'CONFIRMED',
                id: excludeBookingId ? { not: excludeBookingId } : undefined,
                AND: [
                    { startDate: { lt: endDate } },
                    { endDate: { gt: startDate } }
                ]
            }
        });

        return !!overlappingBooking;
    }

    async findAll(userId: string, role: string) {
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

        if (role !== 'ADMIN' && booking.userId !== userId) {
            throw new UnauthorizedError('Vous ne pouvez pas accéder à cette réservation');
        }

        return booking;
    }

    async create(data: CreateBookingDTO, userId: string) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        this.validateDates(startDate, endDate);

        return prisma.$transaction(async (tx) => {
            const vehicles = await tx.$queryRaw<Vehicle[]>`
                SELECT * FROM "Vehicle" 
                WHERE id = ${data.vehicleId}::uuid 
                FOR UPDATE
            `;

            const vehicle = vehicles[0];

            if (!vehicle) {
                throw new NotFoundError('Véhicule non trouvé');
            }

            if (!vehicle.isAvailable) {
                throw new ConflictError('Ce véhicule n\'est pas disponible à la réservation');
            }

            const hasOverlap = await this.checkOverlapInTransaction(
                tx,
                data.vehicleId,
                startDate,
                endDate
            );

            if (hasOverlap) {
                throw new ConflictError(
                    'Ce véhicule est déjà réservé sur cette période. Veuillez choisir d\'autres dates.'
                );
            }

            return tx.booking.create({
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
        });
    }

    async cancel(id: string, userId: string, role: string) {
        const booking = await this.findById(id, userId, role);

        if (booking.status === 'CANCELLED') {
            throw new AppError('Cette réservation est déjà annulée');
        }

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
                endDate: { gte: new Date() }
            },
            orderBy: { startDate: 'asc' }
        });
    }
}