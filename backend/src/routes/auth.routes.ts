import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../dto/auth.schema";
import { validate } from "@/middleware/validate.middleware";
import { authenticate } from "@/middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post('/register/user', validate(registerSchema), authController.register);
router.post('/register/admin', validate(registerSchema), authController.registerAdmin);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;