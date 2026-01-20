import { registerSchema, loginSchema } from '../../../src/dto/auth.schema';
import { createBookingSchema } from '../../../src/dto/booking.schema';
import { createVehicleSchema, updateVehicleSchema, availableVehiclesQuerySchema } from '../../../src/dto/vehicle.schema';

describe('Schémas de Validation Zod', () => {

    describe('Auth Schemas', () => {
        
        describe('registerSchema', () => {
            it('devrait valider des données d\'inscription correctes', () => {
                const validData = {
                    email: 'test@example.com',
                    password: 'Password123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+22890000000',
                };

                const result = registerSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('devrait rejeter un email invalide', () => {
                const invalidData = {
                    email: 'not-an-email',
                    password: 'SecureP@ss123!',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+22890000000',
                };

                const result = registerSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it('devrait rejeter un mot de passe trop court (< 8 caractères)', () => {
                const invalidData = {
                    email: 'test@example.com',
                    password: '1234567', // 7 caractères
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+22890000000',
                };

                const result = registerSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it('devrait rejeter un prénom trop court', () => {
                const invalidData = {
                    email: 'test@example.com',
                    password: 'SecureP@ss123!',
                    firstName: 'J', // 1 caractère
                    lastName: 'Doe',
                    phone: '+22890000000',
                };

                const result = registerSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it('devrait rejeter un numéro de téléphone au format incorrect', () => {
                const invalidData = {
                    email: 'test@example.com',
                    password: 'SecureP@ss123!',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '0612345678', // Pas de + au début
                };

                const result = registerSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it('devrait accepter un numéro de téléphone au format +XXX XXXXXXXX', () => {
                const validData = {
                    email: 'test@example.com',
                    password: 'SecureP@ss123!',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+22890123456',
                };

                const result = registerSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });

        describe('loginSchema', () => {
            it('devrait valider des identifiants corrects', () => {
                const validData = {
                    email: 'test@example.com',
                    password: 'SecureP@ss123!',
                };

                const result = loginSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('devrait rejeter un mot de passe trop court (< 8 caractères)', () => {
                const invalidData = {
                    email: 'test@example.com',
                    password: '1234567', // 7 caractères
                };

                const result = loginSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('Booking Schemas', () => {
        
        describe('createBookingSchema', () => {
            it('devrait valider une réservation correcte', () => {
                const futureStart = new Date(Date.now() + 86400000 * 2).toISOString();
                const futureEnd = new Date(Date.now() + 86400000 * 5).toISOString();

                const validData = {
                    vehicleId: '550e8400-e29b-41d4-a716-446655440000',
                    startDate: futureStart,
                    endDate: futureEnd,
                    reason: 'Déplacement professionnel',
                    destination: 'Lomé',
                };

                const result = createBookingSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('devrait rejeter un vehicleId qui n\'est pas un UUID', () => {
                const futureStart = new Date(Date.now() + 86400000 * 2).toISOString();
                const futureEnd = new Date(Date.now() + 86400000 * 5).toISOString();

                const invalidData = {
                    vehicleId: 'not-a-uuid',
                    startDate: futureStart,
                    endDate: futureEnd,
                };

                const result = createBookingSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it('devrait rejeter si date de fin avant date de début', () => {
                const futureStart = new Date(Date.now() + 86400000 * 5).toISOString();
                const futureEnd = new Date(Date.now() + 86400000 * 2).toISOString(); // Avant startDate

                const invalidData = {
                    vehicleId: '550e8400-e29b-41d4-a716-446655440000',
                    startDate: futureStart,
                    endDate: futureEnd,
                };

                const result = createBookingSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it('devrait rejeter une date de début dans le passé', () => {
                const pastDate = new Date(Date.now() - 86400000).toISOString(); // Hier
                const futureEnd = new Date(Date.now() + 86400000 * 5).toISOString();

                const invalidData = {
                    vehicleId: '550e8400-e29b-41d4-a716-446655440000',
                    startDate: pastDate,
                    endDate: futureEnd,
                };

                const result = createBookingSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it('devrait rejeter un format de date invalide', () => {
                const invalidData = {
                    vehicleId: '550e8400-e29b-41d4-a716-446655440000',
                    startDate: '2026-01-20', // Pas ISO 8601 complet
                    endDate: '2026-01-25',
                };

                const result = createBookingSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });
    });

    describe('Vehicle Schemas', () => {
        
        describe('createVehicleSchema', () => {
            it('devrait valider un véhicule correct', () => {
                const validData = {
                    brand: 'Toyota',
                    model: 'Corolla',
                    licensePlate: 'TG-1234-AB',
                };

                const result = createVehicleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('devrait accepter une imageUrl optionnelle', () => {
                const validData = {
                    brand: 'Toyota',
                    model: 'Corolla',
                    licensePlate: 'TG-1234-AB',
                    imageUrl: 'https://example.com/image.jpg',
                };

                const result = createVehicleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('devrait rejeter si la marque est vide', () => {
                const invalidData = {
                    brand: '',
                    model: 'Corolla',
                    licensePlate: 'TG-1234-AB',
                };

                const result = createVehicleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });

            it('devrait rejeter une imageUrl invalide', () => {
                const invalidData = {
                    brand: 'Toyota',
                    model: 'Corolla',
                    licensePlate: 'TG-1234-AB',
                    imageUrl: 'not-a-url',
                };

                const result = createVehicleSchema.safeParse(invalidData);
                expect(result.success).toBe(false);
            });
        });

        describe('updateVehicleSchema', () => {
            it('devrait permettre des mises à jour partielles', () => {
                const validData = {
                    model: 'Camry', // Seulement le modèle
                };

                const result = updateVehicleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });

            it('devrait permettre de modifier isAvailable', () => {
                const validData = {
                    isAvailable: false,
                };

                const result = updateVehicleSchema.safeParse(validData);
                expect(result.success).toBe(true);
            });
        });

        describe('availableVehiclesQuerySchema', () => {
            it('devrait valider des paramètres de requête corrects', () => {
                const validQuery = {
                    startDate: '2026-01-20',
                    endDate: '2026-01-25',
                };

                const result = availableVehiclesQuerySchema.safeParse(validQuery);
                expect(result.success).toBe(true);
            });

            it('devrait rejeter si startDate est manquant', () => {
                const invalidQuery = {
                    endDate: '2026-01-25',
                };

                const result = availableVehiclesQuerySchema.safeParse(invalidQuery);
                expect(result.success).toBe(false);
            });

            it('devrait rejeter si endDate est manquant', () => {
                const invalidQuery = {
                    startDate: '2026-01-20',
                };

                const result = availableVehiclesQuerySchema.safeParse(invalidQuery);
                expect(result.success).toBe(false);
            });
        });
    });
});
