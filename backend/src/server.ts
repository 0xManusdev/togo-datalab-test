import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import { config } from './config/environment';
import { logger } from '@/config/logger'
import { prisma } from './utils/prisma';

const PORT = config.port || 8000;

const startServer = async () => {
    try {
        await prisma.$connect(); 

        console.info('Connexion à la base de données établie avec succès.');

        app.listen(PORT, () => {
            logger.info(`Serveur démarré sur le port: ${PORT}\nURL: http://localhost:${PORT}/api/health`);
        });
    } catch (error) {
        logger.error('Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};

startServer();