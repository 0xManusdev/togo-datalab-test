import { prisma } from '@/utils/prisma';
import { CreateVehicleDTO, UpdateVehicleDTO } from '@/dto/vehicle.schema';
import { ConflictError, NotFoundError } from '@/errors/AppError';
import { createPaginatedResponse } from '@/utils/pagination';

export class VehicleService {
    async findAll(page: number = 1, limit: number = 20) {
        const now = new Date();
        
        const [vehicles, total] = await Promise.all([
            prisma.vehicle.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    bookings: {
                        where: {
                            status: 'CONFIRMED',
                            startDate: { lte: now },
                            endDate: { gte: now }
                        },
                        select: { id: true, startDate: true, endDate: true }
                    }
                }
            }),
            prisma.vehicle.count()
        ]);

        const vehiclesWithStatus = vehicles.map(vehicle => ({
            ...vehicle,
            currentlyBooked: vehicle.bookings.length > 0
        }));

        return createPaginatedResponse(vehiclesWithStatus, total, page, limit);
    }

    async findAvailable(startDate: Date, endDate: Date) {
        return prisma.vehicle.findMany({
            where: {
                isAvailable: true,
                bookings: {
                    none: {
                        status: 'CONFIRMED',
                        startDate: { lt: endDate },
                        endDate: { gt: startDate }
                    }
                }
            }
        });
    }

    async findById(id: string) {
        const now = new Date();
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: { status: 'CONFIRMED' },
                    orderBy: { startDate: 'asc' }
                }
            }
        });

        if (!vehicle) {
            throw new NotFoundError('Véhicule non trouvé');
        }

        const activeBooking = vehicle.bookings.find(booking => 
            booking.startDate <= now && booking.endDate >= now
        );

        return {
            ...vehicle,
            currentlyBooked: !!activeBooking
        };
    }

    async create(data: CreateVehicleDTO) {
        const existing = await prisma.vehicle.findUnique({
            where: { licensePlate: data.licensePlate }
        });

        if (existing) {
            throw new ConflictError('Un véhicule avec cette plaque existe déjà');
        }

        return prisma.vehicle.create({ data });
    }

    async update(id: string, data: UpdateVehicleDTO) {
        await this.findById(id);

        if (data.licensePlate) {
            const existing = await prisma.vehicle.findFirst({
                where: { 
                    licensePlate: data.licensePlate,
                    NOT: { id }
                }
            });
            if (existing) {
                throw new ConflictError('Un véhicule avec cette plaque existe déjà');
            }
        }

        return prisma.vehicle.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        await this.findById(id);
        
        const futureBookings = await prisma.booking.count({
            where: {
                vehicleId: id,
                status: 'CONFIRMED',
                endDate: { gte: new Date() }
            }
        });

        if (futureBookings > 0) {
            throw new ConflictError('Impossible de supprimer : des réservations sont en cours');
        }

        await prisma.booking.deleteMany({ where: { vehicleId: id } });

        return prisma.vehicle.delete({ where: { id } });
    }
}