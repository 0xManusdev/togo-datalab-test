export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Ressource non trouvée') {
        super(message, 404);
    }
}

export class RequiredError extends AppError {
    constructor(message: string = 'Donnée requise manquante') {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Non autorisé') {
        super(message, 401);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflit de données') {
        super(message, 409);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = 'Requête invalide') {
        super(message, 400);
    }
}