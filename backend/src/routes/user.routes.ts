import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authenticate, authorizeAdmin } from '@/middleware/auth.middleware';
import { validateUuidParam } from '@/middleware/validateUuid.middleware';

const router = Router();
const userController = new UserController();

router.use(authenticate);
router.use(authorizeAdmin);

router.get('/', userController.findAll);
router.get('/:id', validateUuidParam('id'), userController.findById);
router.post('/', userController.create);
router.delete('/:id', validateUuidParam('id'), userController.delete);

export default router;
