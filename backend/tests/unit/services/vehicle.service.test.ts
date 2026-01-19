import { VehicleService } from '../../../src/services/vehicle.service';
import { ConflictError, NotFoundError } from '../../../src/errors/AppError';
import { mockPrisma } from '../../setup';

describe('VehicleService', () => {
    let vehicleService: VehicleService;

    beforeEach(() => {
        vehicleService = new VehicleService();
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('devrait retourner les véhicules paginés', async () => {
            const vehicles = [
                { id: 'v1', brand: 'Toyota', model: 'Corolla', licensePlate: 'TG-1234-AB', isAvailable: true, imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
                { id: 'v2', brand: 'Honda', model: 'Civic', licensePlate: 'TG-5678-CD', isAvailable: true, imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
            ];

            mockPrisma.vehicle.findMany.mockResolvedValue(vehicles);
            mockPrisma.vehicle.count.mockResolvedValue(2);

            const result = await vehicleService.findAll(1, 20);

            expect(result.data).toHaveLength(2);
            expect(result.pagination).toBeDefined();
            expect(result.pagination.total).toBe(2);
            expect(result.pagination.page).toBe(1);
            expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
                skip: 0,
                take: 20,
            });
        });

        it('devrait calculer correctement le skip pour la page 2', async () => {
            mockPrisma.vehicle.findMany.mockResolvedValue([]);
            mockPrisma.vehicle.count.mockResolvedValue(25);

            await vehicleService.findAll(2, 10);

            expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
                skip: 10,
                take: 10,
            });
        });
    });

    describe('findAvailable', () => {
        it('devrait retourner uniquement les véhicules disponibles pour la période', async () => {
            const startDate = new Date('2026-02-01');
            const endDate = new Date('2026-02-05');

            mockPrisma.vehicle.findMany.mockResolvedValue([
                { id: 'v1', brand: 'Toyota', model: 'Corolla', licensePlate: 'TG-1234-AB', isAvailable: true, imageUrl: null, createdAt: new Date(), updatedAt: new Date() },
            ]);

            await vehicleService.findAvailable(startDate, endDate);

            expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith({
                where: {
                    isAvailable: true,
                    bookings: {
                        none: {
                            status: 'CONFIRMED',
                            startDate: { lt: endDate },
                            endDate: { gt: startDate },
                        },
                    },
                },
            });
        });
    });

    describe('findById', () => {
        it('devrait retourner un véhicule avec ses réservations confirmées', async () => {
            const vehicle = {
                id: 'v1',
                brand: 'Toyota',
                model: 'Corolla',
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                bookings: [],
            };

            mockPrisma.vehicle.findUnique.mockResolvedValue(vehicle);

            const result = await vehicleService.findById('v1');

            expect(result).toEqual(vehicle);
        });

        it('devrait lever NotFoundError si le véhicule n\'existe pas', async () => {
            mockPrisma.vehicle.findUnique.mockResolvedValue(null);

            await expect(vehicleService.findById('nonexistent')).rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        it('devrait créer un nouveau véhicule', async () => {
            const vehicleData = {
                brand: 'Toyota',
                model: 'Corolla',
                licensePlate: 'TG-1234-AB',
            };

            mockPrisma.vehicle.findUnique.mockResolvedValue(null);
            mockPrisma.vehicle.create.mockResolvedValue({
                id: 'v1',
                ...vehicleData,
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await vehicleService.create(vehicleData);

            expect(result.brand).toBe('Toyota');
            expect(result.licensePlate).toBe('TG-1234-AB');
        });

        it('devrait rejeter si la plaque d\'immatriculation existe déjà', async () => {
            mockPrisma.vehicle.findUnique.mockResolvedValue({
                id: 'existing',
                brand: 'Honda',
                model: 'Civic',
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await expect(
                vehicleService.create({
                    brand: 'Toyota',
                    model: 'Corolla',
                    licensePlate: 'TG-1234-AB',
                })
            ).rejects.toThrow(ConflictError);
        });
    });

    describe('update', () => {
        it('devrait mettre à jour un véhicule existant', async () => {
            mockPrisma.vehicle.findUnique.mockResolvedValue({
                id: 'v1',
                brand: 'Toyota',
                model: 'Corolla',
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                bookings: [],
            });
            mockPrisma.vehicle.findFirst.mockResolvedValue(null);
            mockPrisma.vehicle.update.mockResolvedValue({
                id: 'v1',
                brand: 'Toyota',
                model: 'Camry', // Modifié
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await vehicleService.update('v1', { model: 'Camry' });

            expect(result.model).toBe('Camry');
        });

        it('devrait rejeter si la nouvelle plaque existe déjà sur un autre véhicule', async () => {
            mockPrisma.vehicle.findUnique.mockResolvedValue({
                id: 'v1',
                brand: 'Toyota',
                model: 'Corolla',
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                bookings: [],
            });
            mockPrisma.vehicle.findFirst.mockResolvedValue({
                id: 'v2', // Autre véhicule
                brand: 'Honda',
                model: 'Civic',
                licensePlate: 'TG-9999-ZZ',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await expect(
                vehicleService.update('v1', { licensePlate: 'TG-9999-ZZ' })
            ).rejects.toThrow(ConflictError);
        });
    });

    describe('delete', () => {
        it('devrait supprimer un véhicule sans réservations futures', async () => {
            mockPrisma.vehicle.findUnique.mockResolvedValue({
                id: 'v1',
                brand: 'Toyota',
                model: 'Corolla',
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                bookings: [],
            });
            mockPrisma.booking.count.mockResolvedValue(0);
            mockPrisma.vehicle.delete.mockResolvedValue({
                id: 'v1',
                brand: 'Toyota',
                model: 'Corolla',
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await vehicleService.delete('v1');

            expect(result.id).toBe('v1');
        });

        it('devrait rejeter la suppression si des réservations futures existent', async () => {
            mockPrisma.vehicle.findUnique.mockResolvedValue({
                id: 'v1',
                brand: 'Toyota',
                model: 'Corolla',
                licensePlate: 'TG-1234-AB',
                isAvailable: true,
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                bookings: [],
            });
            mockPrisma.booking.count.mockResolvedValue(2); // 2 réservations futures

            await expect(vehicleService.delete('v1')).rejects.toThrow(ConflictError);
            await expect(vehicleService.delete('v1')).rejects.toThrow('des réservations sont en cours');
        });
    });
});
