export const COOKIE_OPTIONS = {
    httpOnly: true,                                    
    secure: process.env.NODE_ENV === 'production',    
    sameSite: 'lax' as const,  // 'lax' permet les requêtes cross-origin en dev                    
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
};