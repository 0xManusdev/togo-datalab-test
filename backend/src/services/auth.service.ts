import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/client'
import { LoginDTO, RegisterDTO } from '../dto/auth.schema';
import { prisma } from '../utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_temporaire_dev';

export class AuthService {
    async register(data: RegisterDTO) {
        const { email, password, firstName, lastName, phone } = data;

        const existingUser = await prisma.user.findUnique({ 
            where: { email } 
        });

        if (existingUser) {
            throw new Error('Un utilisateur avec cet email existe déjà.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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

    async login(data: LoginDTO) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ 
            where: { email } 
        });

        if (!user) {
            throw new Error('Ce compte n\'existe pas. Veuillez vérifier votre adresse mail ou créer un nouveau compte.');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('Identifiants incorrects. Votre email ou mot de passe est erroné.');
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                role: user.role 
            },

            JWT_SECRET,
            { 
                expiresIn: '24h' 
            }
        );

        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
}