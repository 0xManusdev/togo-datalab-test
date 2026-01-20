import { AuthService } from '../../../src/services/auth.service';
import { AppError } from '../../../src/errors/AppError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockPrisma } from '../../setup';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('devrait authentifier un utilisateur avec des identifiants valides', async () => {
            const user = {
                id: 'user-1',
                email: 'test@example.com',
                password: 'hashed-password',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+22890000000',
                role: 'EMPLOYEE' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockBcrypt.compare.mockResolvedValue(true as never);
            mockJwt.sign.mockReturnValue('jwt-token' as never);

            const result = await authService.login({
                email: 'test@example.com',
                password: 'Password123',
            });

            expect(result.token).toBe('jwt-token');
            expect(result.user.email).toBe(user.email);
            expect(result.user).not.toHaveProperty('password');
        });

        it('devrait rejeter avec message générique si l\'email n\'existe pas', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.login({
                    email: 'nonexistent@example.com',
                    password: 'Password123',
                })
            ).rejects.toThrow('Identifiants incorrects.');
        });

        it('devrait rejeter avec message générique si le mot de passe est incorrect', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                password: 'hashed-password',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+22890000000',
                role: 'EMPLOYEE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockBcrypt.compare.mockResolvedValue(false as never);

            await expect(
                authService.login({
                    email: 'test@example.com',
                    password: 'WrongPassword',
                })
            ).rejects.toThrow('Identifiants incorrects.');
        });

        it('devrait utiliser le même message d\'erreur pour email inexistant et mot de passe incorrect', async () => {
            // Test email inexistant
            mockPrisma.user.findUnique.mockResolvedValue(null);
            
            let errorEmail: Error | null = null;
            try {
                await authService.login({ email: 'nonexistent@example.com', password: 'Password123' });
            } catch (e) {
                errorEmail = e as Error;
            }

            // Test mot de passe incorrect
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                password: 'hashed-password',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+22890000000',
                role: 'EMPLOYEE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockBcrypt.compare.mockResolvedValue(false as never);

            let errorPassword: Error | null = null;
            try {
                await authService.login({ email: 'test@example.com', password: 'WrongPassword' });
            } catch (e) {
                errorPassword = e as Error;
            }

            // Les deux erreurs doivent avoir le même message (sécurité anti-énumération)
            expect(errorEmail?.message).toBe(errorPassword?.message);
            expect(errorEmail?.message).toBe('Identifiants incorrects.');
        });

        it('devrait générer un JWT avec les bonnes propriétés', async () => {
            const user = {
                id: 'user-1',
                email: 'test@example.com',
                password: 'hashed-password',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+22890000000',
                role: 'ADMIN' as const,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.user.findUnique.mockResolvedValue(user);
            mockBcrypt.compare.mockResolvedValue(true as never);
            mockJwt.sign.mockReturnValue('jwt-token' as never);

            await authService.login({
                email: 'test@example.com',
                password: 'Password123',
            });

            expect(mockJwt.sign).toHaveBeenCalledWith(
                { userId: 'user-1', role: 'ADMIN' },
                expect.any(String),
                { expiresIn: '24h' }
            );
        });
    });

    describe('getUserById', () => {
        it('devrait retourner un utilisateur sans mot de passe', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                password: 'hashed-password',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+22890000000',
                role: 'EMPLOYEE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await authService.getUserById('user-1');

            expect(result).not.toHaveProperty('password');
            expect(result.email).toBe('test@example.com');
        });

        it('devrait lever une erreur 404 si l\'utilisateur n\'existe pas', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(authService.getUserById('nonexistent')).rejects.toThrow(AppError);
        });
    });
});
