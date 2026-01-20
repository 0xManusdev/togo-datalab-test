
import { UserService } from '../../../src/services/user.service';
import { prisma } from '../../../src/utils/prisma';
import { ConflictError, NotFoundError } from '../../../src/errors/AppError';
import bcrypt from 'bcryptjs';

jest.mock('@/utils/prisma', () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
}));

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('devrait retourner les utilisateurs paginés', async () => {
            const mockUsers = [{ id: '1', email: 'test@test.com' }];
            (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
            (prisma.user.count as jest.Mock).mockResolvedValue(1);

            const result = await userService.findAll(1, 10);

            expect(prisma.user.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
                skip: 0,
                take: 10,
                select: expect.any(Object),
            });
            expect(result).toEqual({
                data: mockUsers,
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
            });
        });
    });

    describe('findById', () => {
        it('devrait retourner un utilisateur existant', async () => {
            const mockUser = { id: '1', email: 'test@test.com' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const result = await userService.findById('1');

            expect(result).toEqual(mockUser);
        });

        it('devrait lever NotFoundError si utilisateur inexistant', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(userService.findById('999')).rejects.toThrow(NotFoundError);
        });
    });

    describe('create', () => {
        const createUserDto = {
            email: 'new@test.com',
            password: 'password123',
            firstName: 'New',
            lastName: 'User',
            phone: '+22899999999',
            role: 'EMPLOYEE' as const,
        };

        it('devrait créer un nouvel utilisateur avec mot de passe haché', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', ...createUserDto });

            await userService.create(createUserDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
            expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    password: 'hashedPassword',
                }),
            }));
        });

        it('devrait rejeter si email déjà utilisé', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

            await expect(userService.create(createUserDto)).rejects.toThrow(ConflictError);
        });
    });

    describe('update', () => {
        const updateData = { firstName: 'Updated', email: 'updated@test.com' };

        it('devrait mettre à jour un utilisateur', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.user.update as jest.Mock).mockResolvedValue({ id: '1', ...updateData });

            await userService.update('1', updateData);

            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: '1' },
                data: expect.objectContaining(updateData),
            }));
        });

        it('devrait rejeter si email déjà pris par un autre', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: '2' });

            await expect(userService.update('1', updateData)).rejects.toThrow(ConflictError);
        });
    });

    describe('delete', () => {
        it('devrait supprimer un utilisateur existant', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });

            await userService.delete('1');

            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
        });

        it('devrait lever NotFoundError si utilisateur inexistant', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(userService.delete('999')).rejects.toThrow(NotFoundError);
        });
    });
});
