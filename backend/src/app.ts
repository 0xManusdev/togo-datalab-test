import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import des routes (on créera ces fichiers juste après)
// import authRoutes from './routes/auth.routes';
// import bookingRoutes from './routes/booking.routes';

const app: Application = express();
app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'API en ligne !',
        timestamp: new Date().toISOString()
    });
});

// Montage des futurs routeurs (décommenter quand ils seront créés)
// app.use('/api/auth', authRoutes);
// app.use('/api/bookings', bookingRoutes);

// Gestion basique des erreurs 404
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint introuvable' });
});

export default app;