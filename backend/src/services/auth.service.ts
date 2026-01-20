import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginDTO } from '@/dto/auth.schema';
import { prisma } from '@/utils/prisma';
import { config } from '@/config/environment';
import { AppError, UnauthorizedError } from '@/errors/AppError';


export class AuthService {

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