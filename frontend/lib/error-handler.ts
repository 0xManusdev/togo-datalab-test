import { toast } from "sonner";
import { ApiError } from "./api";

export function handleError(error: unknown, context?: string): void {
    let message: string;
    let description: string | undefined;

    if (error instanceof ApiError) {
        message = context ?? "Erreur";
        description = error.message;

        // Handle specific HTTP status codes
        if (error.statusCode === 401) {
            message = "Session expirée";
            description = "Veuillez vous reconnecter";
        } else if (error.statusCode === 403) {
            message = "Accès refusé";
            description = "Vous n'avez pas les permissions nécessaires";
        } else if (error.statusCode === 404) {
            message = "Non trouvé";
            description = "La ressource demandée n'existe pas";
        } else if (error.statusCode >= 500) {
            message = "Erreur serveur";
            description = "Une erreur inattendue s'est produite. Réessayez plus tard.";
        }
    } else if (error instanceof Error) {
        message = context ?? "Erreur";
        description = error.message;
    } else {
        message = context ?? "Erreur";
        description = "Une erreur inattendue s'est produite";
    }

    toast.error(message, { description });
}

export async function withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        handleError(error, context);
        return null;
    }
}
