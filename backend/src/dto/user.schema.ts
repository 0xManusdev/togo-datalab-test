import { z } from 'zod';
import { registerSchema } from './auth.schema';

export const createUserSchema = registerSchema.extend({
    role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
