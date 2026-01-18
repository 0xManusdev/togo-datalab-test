import { BookingService } from '@/services/booking.service';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '@/errors/AppError';
import { mockPrisma } from '../../setup';

describe('BookingService', () => {
    let bookingService: BookingService;

    beforeEach(() => {
        bookingService = new BookingService();
        jest.clearAllMocks();
    });

    describe('Validation des dates', () => {
        it('devrait rejeter une réservation avec date de fin avant date de début', async () => {
            const startDate = new Date('2026-01-20T10:00:00Z');
            const endDate = new Date('2026-01-18T10:00:00Z'); // Avant startDate

            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: true }]),
                    booking: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        create: jest.fn(),
                    },
                });
            });

            await expect(
                bookingService.create(
                    { vehicleId: 'vehicle-1', startDate: startDate.toISOString(), endDate: endDate.toISOString() },
                    'user-1'
                )
            ).rejects.toThrow(AppError);
        });

        it('devrait rejeter une réservation dans le passé', async () => {
            const pastDate = new Date('2020-01-01T10:00:00Z');
            const endDate = new Date('2020-01-05T10:00:00Z');

            await expect(
                bookingService.create(
                    { vehicleId: 'vehicle-1', startDate: pastDate.toISOString(), endDate: endDate.toISOString() },
                    'user-1'
                )
            ).rejects.toThrow('Impossible de créer une réservation dans le passé');
        });
    });

    describe('Détection des chevauchements de réservation', () => {
        const futureStart = new Date(Date.now() + 86400000 * 5); // Dans 5 jours
        const futureEnd = new Date(Date.now() + 86400000 * 10); // Dans 10 jours

        it('devrait rejeter une réservation qui chevauche une réservation existante (cas 1: nouvelle réservation englobe)', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: true }]),
                    booking: {
                        findFirst: jest.fn().mockResolvedValue({
                            id: 'existing-booking',
                            vehicleId: 'vehicle-1',
                            startDate: futureStart,
                            endDate: futureEnd,
                            status: 'CONFIRMED',
                        }),
                        create: jest.fn(),
                    },
                });
            });

            const newStart = new Date(futureStart.getTime() - 86400000 * 2);
            const newEnd = new Date(futureEnd.getTime() + 86400000 * 2);

            await expect(
                bookingService.create(
                    { vehicleId: 'vehicle-1', startDate: newStart.toISOString(), endDate: newEnd.toISOString() },
                    'user-1'
                )
            ).rejects.toThrow(ConflictError);
        });

        it('devrait rejeter une réservation qui chevauche partiellement au début', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: true }]),
                    booking: {
                        findFirst: jest.fn().mockResolvedValue({
                            id: 'existing-booking',
                            vehicleId: 'vehicle-1',
                            startDate: futureStart,
                            endDate: futureEnd,
                            status: 'CONFIRMED',
                        }),
                        create: jest.fn(),
                    },
                });
            });

            const newStart = new Date(futureStart.getTime() - 86400000 * 2);
            const newEnd = new Date(futureStart.getTime() + 86400000 * 2);

            await expect(
                bookingService.create(
                    { vehicleId: 'vehicle-1', startDate: newStart.toISOString(), endDate: newEnd.toISOString() },
                    'user-1'
                )
            ).rejects.toThrow(ConflictError);
        });

        it('devrait rejeter une réservation qui chevauche partiellement à la fin', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: true }]),
                    booking: {
                        findFirst: jest.fn().mockResolvedValue({
                            id: 'existing-booking',
                            vehicleId: 'vehicle-1',
                            startDate: futureStart,
                            endDate: futureEnd,
                            status: 'CONFIRMED',
                        }),
                        create: jest.fn(),
                    },
                });
            });

            const newStart = new Date(futureEnd.getTime() - 86400000 * 2);
            const newEnd = new Date(futureEnd.getTime() + 86400000 * 5);

            await expect(
                bookingService.create(
                    { vehicleId: 'vehicle-1', startDate: newStart.toISOString(), endDate: newEnd.toISOString() },
                    'user-1'
                )
            ).rejects.toThrow(ConflictError);
        });

        it('devrait rejeter une réservation incluse dans une réservation existante', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: true }]),
                    booking: {
                        findFirst: jest.fn().mockResolvedValue({
                            id: 'existing-booking',
                            vehicleId: 'vehicle-1',
                            startDate: futureStart,
                            endDate: futureEnd,
                            status: 'CONFIRMED',
                        }),
                        create: jest.fn(),
                    },
                });
            });

            const newStart = new Date(futureStart.getTime() + 86400000 * 2);
            const newEnd = new Date(futureEnd.getTime() - 86400000 * 2);

            await expect(
                bookingService.create(
                    { vehicleId: 'vehicle-1', startDate: newStart.toISOString(), endDate: newEnd.toISOString() },
                    'user-1'
                )
            ).rejects.toThrow(ConflictError);
        });

        it('devrait accepter une réservation qui ne chevauche PAS (avant)', async () => {
            const createdBooking = {
                id: 'new-booking',
                vehicleId: 'vehicle-1',
                userId: 'user-1',
                startDate: new Date(Date.now() + 86400000 * 2),
                endDate: new Date(Date.now() + 86400000 * 4),
                status: 'CONFIRMED',
                vehicle: { id: 'vehicle-1', brand: 'Toyota', model: 'Corolla' },
            };

            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: true }]),
                    booking: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockResolvedValue(createdBooking),
                    },
                });
            });

            const newStart = new Date(Date.now() + 86400000 * 2);
            const newEnd = new Date(Date.now() + 86400000 * 4);

            const result = await bookingService.create(
                { vehicleId: 'vehicle-1', startDate: newStart.toISOString(), endDate: newEnd.toISOString() },
                'user-1'
            );

            expect(result).toBeDefined();
            expect(result.vehicleId).toBe('vehicle-1');
        });

        it('devrait accepter une réservation qui ne chevauche PAS (après)', async () => {
            const createdBooking = {
                id: 'new-booking',
                vehicleId: 'vehicle-1',
                userId: 'user-1',
                startDate: new Date(Date.now() + 86400000 * 15),
                endDate: new Date(Date.now() + 86400000 * 20),
                status: 'CONFIRMED',
                vehicle: { id: 'vehicle-1', brand: 'Toyota', model: 'Corolla' },
            };

            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: true }]),
                    booking: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockResolvedValue(createdBooking),
                    },
                });
            });

            const newStart = new Date(Date.now() + 86400000 * 15);
            const newEnd = new Date(Date.now() + 86400000 * 20);

            const result = await bookingService.create(
                { vehicleId: 'vehicle-1', startDate: newStart.toISOString(), endDate: newEnd.toISOString() },
                'user-1'
            );

            expect(result).toBeDefined();
        });

        it('devrait ignorer les réservations CANCELLED lors de la vérification de chevauchement', async () => {
            const createdBooking = {
                id: 'new-booking',
                vehicleId: 'vehicle-1',
                userId: 'user-1',
                startDate: futureStart,
                endDate: futureEnd,
                status: 'CONFIRMED',
                vehicle: { id: 'vehicle-1', brand: 'Toyota', model: 'Corolla' },
            };

            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: true }]),
                    booking: {
                        findFirst: jest.fn().mockResolvedValue(null),
                        create: jest.fn().mockResolvedValue(createdBooking),
                    },
                });
            });

            const result = await bookingService.create(
                { vehicleId: 'vehicle-1', startDate: futureStart.toISOString(), endDate: futureEnd.toISOString() },
                'user-1'
            );

            expect(result).toBeDefined();
            expect(result.status).toBe('CONFIRMED');
        });
    });

    describe('Disponibilité du véhicule', () => {
        it('devrait rejeter une réservation si le véhicule n\'existe pas', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([]),
                    booking: { findFirst: jest.fn(), create: jest.fn() },
                });
            });

            const futureStart = new Date(Date.now() + 86400000 * 5);
            const futureEnd = new Date(Date.now() + 86400000 * 10);

            await expect(
                bookingService.create(
                    { vehicleId: 'non-existent', startDate: futureStart.toISOString(), endDate: futureEnd.toISOString() },
                    'user-1'
                )
            ).rejects.toThrow(NotFoundError);
        });

        it('devrait rejeter une réservation si le véhicule est indisponible', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback: any) => {
                return callback({
                    $queryRaw: jest.fn().mockResolvedValue([{ id: 'vehicle-1', isAvailable: false }]),
                    booking: { findFirst: jest.fn(), create: jest.fn() },
                });
            });

            const futureStart = new Date(Date.now() + 86400000 * 5);
            const futureEnd = new Date(Date.now() + 86400000 * 10);

            await expect(
                bookingService.create(
                    { vehicleId: 'vehicle-1', startDate: futureStart.toISOString(), endDate: futureEnd.toISOString() },
                    'user-1'
                )
            ).rejects.toThrow(ConflictError);
        });
    });

    describe('Annulation de réservation', () => {
        it('devrait rejeter l\'annulation d\'une réservation déjà annulée', async () => {
            mockPrisma.booking.findUnique.mockResolvedValue({
                id: 'booking-1',
                userId: 'user-1',
                vehicleId: 'vehicle-1',
                startDate: new Date(Date.now() + 86400000 * 5),
                endDate: new Date(Date.now() + 86400000 * 10),
                status: 'CANCELLED',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await expect(
                bookingService.cancel('booking-1', 'user-1', 'EMPLOYEE')
            ).rejects.toThrow('Cette réservation est déjà annulée');
        });

        it('devrait rejeter l\'annulation d\'une réservation passée', async () => {
            mockPrisma.booking.findUnique.mockResolvedValue({
                id: 'booking-1',
                userId: 'user-1',
                vehicleId: 'vehicle-1',
                startDate: new Date(Date.now() - 86400000 * 5),
                endDate: new Date(Date.now() - 86400000 * 2),
                status: 'CONFIRMED',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await expect(
                bookingService.cancel('booking-1', 'user-1', 'EMPLOYEE')
            ).rejects.toThrow('Impossible d\'annuler une réservation passée ou en cours');
        });
    });

    describe('Contrôle d\'accès aux réservations', () => {
        it('devrait permettre à un utilisateur de voir sa propre réservation', async () => {
            const booking = {
                id: 'booking-1',
                userId: 'user-1',
                vehicleId: 'vehicle-1',
                startDate: new Date(),
                endDate: new Date(),
                status: 'CONFIRMED',
                vehicle: { id: 'vehicle-1', brand: 'Toyota', model: 'Corolla' },
                user: { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
            };

            mockPrisma.booking.findUnique.mockResolvedValue(booking);

            const result = await bookingService.findById('booking-1', 'user-1', 'EMPLOYEE');

            expect(result).toEqual(booking);
        });

        it('devrait refuser à un utilisateur de voir la réservation d\'un autre', async () => {
            mockPrisma.booking.findUnique.mockResolvedValue({
                id: 'booking-1',
                userId: 'other-user',
                vehicleId: 'vehicle-1',
                startDate: new Date(),
                endDate: new Date(),
                status: 'CONFIRMED',
            });

            await expect(
                bookingService.findById('booking-1', 'user-1', 'EMPLOYEE')
            ).rejects.toThrow(UnauthorizedError);
        });

        it('devrait permettre à un admin de voir n\'importe quelle réservation', async () => {
            const booking = {
                id: 'booking-1',
                userId: 'other-user',
                vehicleId: 'vehicle-1',
                startDate: new Date(),
                endDate: new Date(),
                status: 'CONFIRMED',
                vehicle: { id: 'vehicle-1', brand: 'Toyota', model: 'Corolla' },
                user: { id: 'other-user', firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com' },
            };

            mockPrisma.booking.findUnique.mockResolvedValue(booking);

            const result = await bookingService.findById('booking-1', 'admin-1', 'ADMIN');

            expect(result).toEqual(booking);
        });
    });
});
