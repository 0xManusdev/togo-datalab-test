import { VehicleController } from '@/controllers/vehicle.controller';
import { createVehicleSchema, updateVehicleSchema } from '@/dto/vehicle.schema';
import { authenticate, authorizeAdmin } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { validateUuidParam } from '@/middleware/validateUuid.middleware';
import { vehicleImageUpload } from '@/config/multer.config';
import { Router } from 'express';


const router = Router();
const vehicleController = new VehicleController();

router.use(authenticate);

router.get('/', vehicleController.findAll);
router.get('/available', vehicleController.findAvailable);
router.get('/:id', validateUuidParam('id'), vehicleController.findById);

router.post('/', authorizeAdmin, vehicleImageUpload, vehicleController.create);
router.put('/:id', authorizeAdmin, validateUuidParam('id'), vehicleImageUpload, vehicleController.update);
router.delete('/:id', authorizeAdmin, validateUuidParam('id'), vehicleController.delete);

export default router;