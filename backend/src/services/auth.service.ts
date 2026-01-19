import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginDTO, RegisterDTO } from '../dto/auth.schema';
import { prisma } from '../utils/prisma';
import { config } from '@/config/environment';
import { AppError, ConflictError, UnauthorizedError } from '@/errors/AppError';


export class AuthService {

    async register(data: RegisterDTO) {
        const { email, password, firstName, lastName, phone } = data;

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
                role: 'EMPLOYEE',
            },
        });

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async registerAdmin(data: RegisterDTO) {
        const { email, password, firstName, lastName, phone } = data;

        const existingUser = await prisma.user.findUnique({ 
            where: { email } 
        });

        if (existingUser) {
            throw new ConflictError('Un administrateur avec cette adresse email existe déjà.');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: 'ADMIN',
            },
        });

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(data: LoginDTO) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ 
            where: { email } 
        });

        if (!user) {
            throw new UnauthorizedError('Identifiants incorrects.');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new UnauthorizedError('Identifiants incorrects.');
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role 
            },
            config.jwtSecret,
            { 
                expiresIn: '24h' 
            }
        );

        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }

    async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new AppError('Utilisateur non trouvé', 404);
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}