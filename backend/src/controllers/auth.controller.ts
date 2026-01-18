import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { COOKIE_OPTIONS } from "@/utils/cookie.config";
import { AppError } from "@/errors/AppError";
import { AuthRequest } from "@/middleware/auth.middleware";


export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await this.authService.register(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Inscription réussie',
                data: response
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ 
                    status: 'error',
                    message: error.message 
                });
                return;
            }
            next(error);
        }
    }

    public registerAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const response = await this.authService.registerAdmin(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Administrateur ajouté !',
                data: response
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ 
                    status: 'error',
                    message: error.message 
                });
                return;
            }
            next(error);
        }
    }

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user, token } = await this.authService.login(req.body);
            
            res.cookie('token', token, COOKIE_OPTIONS);
            
            res.status(200).json({
                status: 'success',
                message: 'Connexion réussie',
                data: { user } 
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ 
                    status: 'error',
                    message: error.message 
                });
                return;
            }
            next(error);
        }
    }

    public logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie('token', COOKIE_OPTIONS);
            
            res.status(200).json({
                status: 'success',
                message: 'Déconnexion réussie'
            });
        } catch (error) {
            next(error);
        }
    }

    public me = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    status: 'error',
                    message: 'Non authentifié' 
                });
            }
            
            const user = await this.authService.getUserById(req.user.userId);
            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ 
                    status: 'error',
                    message: error.message 
                });
                return;
            }
            next(error);
        }
    }
}