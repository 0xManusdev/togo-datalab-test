import {z} from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: 'Email invalide.' }),
    password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' }),
    firstName: z.string().min(2, { message: 'Le nom complet doit contenir au moins 2 caractères.' }),
    lastName: z.string().min(2, { message: 'Le nom de famille doit contenir au moins 2 caractères.' }),
    phone: z.string().regex(/^\+\d{3}\d{8}$/, {message: 'Le numéro de téléphone doit être au format +228 90000000 (Indicatif + 5 Chiffres).'}),
});


export const loginSchema = z.object({
    email: z.string().email({ message: 'Email invalide.' }),
    password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' }),
});


export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;