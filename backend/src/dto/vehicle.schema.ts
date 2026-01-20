import { z } from 'zod';

export const createVehicleSchema = z.object({
    brand: z.string().min(1, 'La marque est requise'),
    model: z.string().min(1, 'Le modèle est requis'),
    licensePlate: z.string().min(1, 'La plaque d\'immatriculation est requise'),
    imageUrl: z.string().url().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
    isAvailable: z.preprocess((val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return val;
    }, z.boolean().optional()),
});

export const availableVehiclesQuerySchema = z.object({
    startDate: z.string({ message: 'startDate est requis' }),
    endDate: z.string({ message: 'endDate est requis' }),
});

export type CreateVehicleDTO = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDTO = z.infer<typeof updateVehicleSchema>;
export type AvailableVehiclesQuery = z.infer<typeof availableVehiclesQuerySchema>;