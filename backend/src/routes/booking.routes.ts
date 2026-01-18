import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { validateUuidParam } from '../middleware/validateUuid.middleware';
import { createBookingSchema } from '../dto/booking.schema';

const router = Router();
const bookingController = new BookingController();

router.use(authenticate);

router.get('/', bookingController.findAll);
router.get('/:id', validateUuidParam('id'), bookingController.findById);
router.post('/', validate(createBookingSchema), bookingController.create);
router.patch('/:id/cancel', validateUuidParam('id'), bookingController.cancel);
router.get('/vehicle/:vehicleId', validateUuidParam('vehicleId'), bookingController.getVehicleBookings);

export default router;