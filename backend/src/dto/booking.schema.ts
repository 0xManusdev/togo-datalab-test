import { z } from 'zod';

export const createBookingSchema = z.object({
    vehicleId: z.string().uuid('ID véhicule invalide'),
    startDate: z.string().datetime({ message: 'Date de début invalide' }),
    endDate: z.string().datetime({ message: 'Date de fin invalide' }),
    reason: z.string().min(5, 'Le motif doit contenir au moins 5 caractères').max(500, 'Le motif ne peut pas dépasser 500 caractères'),
}).refine(data => new Date(data.startDate) < new Date(data.endDate), {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate']
}).refine(data => new Date(data.startDate) >= new Date(), {
    message: 'La date de début ne peut pas être dans le passé',
    path: ['startDate']
});

export const queryBookingsSchema = z.object({
    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;
export type QueryBookingsDTO = z.infer<typeof queryBookingsSchema>;