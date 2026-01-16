import dotenv from 'dotenv';
import {z} from 'zod';


dotenv.config();

export const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('8000'),
    DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL est requis.' }),
    JWT_SECRET: z.string().min(1, { message: 'JWT_SECRET est requis.' }),
    RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).optional().default('100'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('Erreur de validation des variables d\'environnement:', parsed.error.format());
    process.exit(1);
}

export const config = {
    port: parseInt(parsed.data.PORT, 10),
    nodeEnv: parsed.data.NODE_ENV,
    databaseUrl: parsed.data.DATABASE_URL,
    jwtSecret: parsed.data.JWT_SECRET,
    rateLimitMaxRequests: parseInt(parsed.data.RATE_LIMIT_MAX_REQUESTS, 10),
}