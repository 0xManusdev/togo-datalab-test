import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { logger } from './config/logger';
import { AppError } from './errors/AppError';

import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import bookingRoutes from './routes/booking.routes';

const app: Application = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true  // Permet l'envoi des cookies
}));
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'API en ligne !',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((req: Request, res: Response) => {
    res.status(404).json({ 
        status: 'error',
        error: 'Route non trouvée' 
    });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, { stack: err.stack });

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