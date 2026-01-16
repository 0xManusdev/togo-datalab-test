import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const COOKIE_OPTIONS = {
    httpOnly: true,                                    
    secure: process.env.NODE_ENV === 'production',    
    sameSite: 'strict' as const,                      
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
};

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public register = async (req: Request, res: Response) => {
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

    public registerAdmin = async (req: Request, res: Response) => {
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

    public login = async (req: Request, res: Response) => {
        try {
            const { user, token } = await this.authService.login(req.body);
            
            res.cookie('token', token, COOKIE_OPTIONS);
            
            res.status(200).json({
                status: 'success',
                message: 'Connexion réussie',
                data: { user } 
            });
        } catch (error) {
            res.status(500).json({ error: 'Erreur serveur lors de la connexion. Vérifiez vos identifiants.' });
        }
    }

    public logout = async (req: Request, res: Response) => {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });
            
            res.status(200).json({
                status: 'success',
                message: 'Déconnexion réussie'
            });
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
    }

    public me = async (req: Request, res: Response) => {
        try {
            const authReq = req as any;
            if (!authReq.user) {
                return res.status(401).json({ error: 'Non authentifié' });
            }
            
            const user = await this.authService.getUserById(authReq.user.userId);
            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
}