import { VehicleController } from '@/controllers/vehicle.controller';
import { createVehicleSchema, updateVehicleSchema } from '@/dto/vehicle.schema';
import { authenticate, authorizeAdmin } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { Router } from 'express';


const router = Router();
const vehicleController = new VehicleController();

router.use(authenticate);

router.get('/', vehicleController.findAll);
router.get('/available', vehicleController.findAvailable);
router.get('/:id', vehicleController.findById);

router.post('/', authorizeAdmin, validate(createVehicleSchema), vehicleController.create);
router.put('/:id', authorizeAdmin, validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', authorizeAdmin, vehicleController.delete);

export default router;