import { prisma } from '../utils/prisma';
import { CreateVehicleDTO, UpdateVehicleDTO } from '../dto/vehicle.schema';
import { ConflictError, NotFoundError } from '../errors/AppError';

export class VehicleService {
    async findAll() {
        return prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async findAvailable(startDate: Date, endDate: Date) {
        return prisma.vehicle.findMany({
            where: {
                isAvailable: true,
                bookings: {
                    none: {
                        status: 'CONFIRMED',
                        OR: [
                            {
                                startDate: { lte: endDate },
                                endDate: { gte: startDate }
                            }
                        ]
                    }
                }
            }
        });
    }

    async findById(id: string) {
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

        return vehicle;
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

        return prisma.vehicle.delete({ where: { id } });
    }
}