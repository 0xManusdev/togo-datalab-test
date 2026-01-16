import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public registerClient = async (req: Request, res : Response) => {
        try {
            const response = await this.authService.register(req.body);
            res.status(201).json(response);
        } catch (error) {
            res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
        }
    }

    public loginClient = async (req: Request, res : Response) => {
        try {
            const response = await this.authService.login(req.body);
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: 'Erreur serveur lors de la connexion. Vérifiez vos identifiants.' });
        }
    }
}