import { config } from "@/config/environment";

const isProduction = config.nodeEnv === 'production';

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
};