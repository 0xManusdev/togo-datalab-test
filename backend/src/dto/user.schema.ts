import { z } from 'zod';
import { registerSchema } from './auth.schema';

export const createUserSchema = registerSchema.extend({
    role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
});

export const updateUserSchema = z.object({
    email: z.string().email({ message: 'Email invalide.' }).optional(),
    firstName: z.string().min(2, { message: 'Le prénom doit contenir au moins 2 caractères.' }).optional(),
    lastName: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }).optional(),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

