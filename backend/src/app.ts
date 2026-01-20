import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { logger } from '@/config/logger';
import { AppError } from '@/errors/AppError';
import { authRateLimiter, apiRateLimiter } from '@/middleware/rateLimit.middleware';
import { prisma } from '@/utils/prisma';

import authRoutes from '@/routes/auth.routes';
import vehicleRoutes from '@/routes/vehicle.routes';
import bookingRoutes from '@/routes/booking.routes';
import userRoutes from '@/routes/user.routes';
import { config } from '@/config/environment';

const app: Application = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: config.frontendUrl || 'http://localhost:3000',
    credentials: true
}));

const morganStream = {
    write: (message: string) => logger.info(message.trim())
};
app.use(morgan('combined', { stream: morganStream }));

app.use(cookieParser());
app.use(express.json());

app.use('/api', apiRateLimiter);

app.get('/api/health', async (req: Request, res: Response) => {
    const healthcheck = {
        status: 'success',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            api: 'healthy',
            database: 'unknown'
        }
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        healthcheck.services.database = 'healthy';
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.status = 'degraded';
        healthcheck.services.database = 'unhealthy';
        logger.error('Database health check failed', { error });
        res.status(503).json(healthcheck);
    }
});

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ 
        status: 'error',
        error: 'Route non trouvée' 
    });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, { 
        stack: config.nodeEnv === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
        return;
    }

    res.status(500).json({
        status: 'error',
        message: 'Erreur interne du serveur'
    });
});

export default app;