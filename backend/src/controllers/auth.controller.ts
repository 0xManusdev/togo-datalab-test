import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public register = async (req: Request, res : Response) => {
        try {
            const response = await this.authService.register(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Inscription réussie',
                data: response
            });
        } catch (error) {
            res.status(500).json({ 
                error: error
            });
        }
    }

    public registerAdmin = async (req: Request, res : Response) => {
        try {
            const response = await this.authService.registerAdmin(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Administrateur ajouté !',
                data: response
            });
        } catch (error) {
            res.status(500).json({ 
                error: error
            });
        }
    }

    public login = async (req: Request, res : Response) => {
        try {
            const response = await this.authService.login(req.body);
            res.status(200).json({
                status: 'success',
                message: 'Connexion réussie',
                data: response
            });
        } catch (error) {
            res.status(500).json({ error: 'Erreur serveur lors de la connexion. Vérifiez vos identifiants.' });
        }
    }
}