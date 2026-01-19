import { VehicleController } from '@/controllers/vehicle.controller';
import { createVehicleSchema, updateVehicleSchema } from '@/dto/vehicle.schema';
import { authenticate, authorizeAdmin } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { validateUuidParam } from '@/middleware/validateUuid.middleware';
import { Router } from 'express';


const router = Router();
const vehicleController = new VehicleController();

router.use(authenticate);

router.get('/available', vehicleController.findAvailable);
router.get('/:id', validateUuidParam('id'), vehicleController.findById);
router.get('/', authorizeAdmin, vehicleController.findAll);

router.post('/', authorizeAdmin, validate(createVehicleSchema), vehicleController.create);
router.put('/:id', authorizeAdmin, validateUuidParam('id'), validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', authorizeAdmin, validateUuidParam('id'), vehicleController.delete);

export default router;