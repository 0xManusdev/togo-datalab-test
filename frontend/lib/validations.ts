import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const registerSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    phone: z.string().regex(/^\+\d{3}\d{8}$/, "Format: +228 90000000"),
});

export const createBookingSchema = z.object({
    vehicleId: z.string().uuid("Véhicule invalide"),
    startDate: z.string().datetime("Date de début invalide"),
    endDate: z.string().datetime("Date de fin invalide"),
    reason: z.string().min(5, "Le motif doit contenir au moins 5 caractères").max(500, "La raison ne peut pas dépasser 500 caractères"),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "La date de fin doit être après la date de début",
    path: ["endDate"],
}).refine((data) => new Date(data.startDate) >= new Date(), {
    message: "La date de début ne peut pas être dans le passé",
    path: ["startDate"],
});

export const createVehicleSchema = z.object({
    brand: z.string().min(1, "La marque est requise"),
    model: z.string().min(1, "Le modèle est requis"),
    licensePlate: z.string().min(1, "La plaque est requise"),
    imageUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
    isAvailable: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
