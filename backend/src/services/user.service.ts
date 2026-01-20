import { prisma } from '../utils/prisma';
import { RegisterDTO } from '../dto/auth.schema';
import { ConflictError, NotFoundError } from '../errors/AppError';
import { createPaginatedResponse } from '../utils/pagination';
import bcrypt from 'bcryptjs';

export class UserService {
    async findAll(page: number = 1, limit: number = 20) {
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            prisma.user.count()
        ]);

        return createPaginatedResponse(users, total, page, limit);
    }

    async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('Utilisateur non trouvé');
        }

        return user;
    }

    async create(data: RegisterDTO & { role?: 'ADMIN' | 'EMPLOYEE' }) {
        const { email, password, firstName, lastName, phone, role = 'EMPLOYEE' } = data;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new ConflictError('Un utilisateur avec cette adresse email existe déjà.');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    }

    async delete(id: string) {
        await this.findById(id);
        
        await prisma.user.delete({ where: { id } });
    }
}
