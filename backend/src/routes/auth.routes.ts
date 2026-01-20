import { Router } from "express";
import { validate } from "@/middleware/validate.middleware";
import { authenticate, authorizeAdmin } from "@/middleware/auth.middleware";
import { loginSchema, registerSchema } from "@/dto/auth.schema";
import { AuthController } from "@/controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;