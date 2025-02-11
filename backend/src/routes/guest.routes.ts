import { Router } from 'express';
import * as guestController from '../controllers/guest.controller';

const router = Router();

router.put('/', guestController.createGuest);
router.put('/:id', guestController.updateGuest);
router.delete('/:id', guestController.deleteGuest);
router.put('/:id/attendance', guestController.markAttendance);
router.put('/:id/emailstatus', guestController.markEmailSent);

export default router;

