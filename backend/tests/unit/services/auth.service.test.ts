import { AuthService } from '@/services/auth.service';
import { ConflictError, UnauthorizedError, AppError } from '@/errors/AppError';
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

    describe('register', () => {
        it('devrait créer un nouvel utilisateur avec succès', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'Password123',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+22890000000',
            };

            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
            mockPrisma.user.create.mockResolvedValue({
                id: 'user-1',
                email: userData.email,
                password: 'hashed-password',
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone,
                role: 'EMPLOYEE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await authService.register(userData);

            expect(result).toBeDefined();
            expect(result.email).toBe(userData.email);
            expect(result).not.toHaveProperty('password'); // Mot de passe exclu
            expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
        });

        it('devrait rejeter l\'inscription si l\'email existe déjà', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'existing-user',
                email: 'test@example.com',
                password: 'hashed',
                firstName: 'Existing',
                lastName: 'User',
                phone: '+22890000000',
                role: 'EMPLOYEE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await expect(
                authService.register({
                    email: 'test@example.com',
                    password: 'Password123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+22890000001',
                })
            ).rejects.toThrow(ConflictError);
        });

        it('devrait hasher le mot de passe avec un coût de 12', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
            mockPrisma.user.create.mockResolvedValue({
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

            await authService.register({
                email: 'test@example.com',
                password: 'MySecurePassword',
                firstName: 'John',
                lastName: 'Doe',
                phone: '+22890000000',
            });

            expect(mockBcrypt.hash).toHaveBeenCalledWith('MySecurePassword', 12);
        });
    });

    describe('registerAdmin', () => {
        it('devrait créer un admin avec le rôle ADMIN', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
            mockPrisma.user.create.mockResolvedValue({
                id: 'admin-1',
                email: 'admin@example.com',
                password: 'hashed-password',
                firstName: 'Admin',
                lastName: 'User',
                phone: '+22890000000',
                role: 'ADMIN',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const result = await authService.registerAdmin({
                email: 'admin@example.com',
                password: 'AdminPassword123',
                firstName: 'Admin',
                lastName: 'User',
                phone: '+22890000000',
            });

            expect(result.role).toBe('ADMIN');
        });
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
