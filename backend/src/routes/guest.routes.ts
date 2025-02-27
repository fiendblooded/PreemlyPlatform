import { Router } from 'express';
import * as guestController from '../controllers/guest.controller';

const router = Router();

router.post('/', guestController.createGuest);
router.put('/:id', guestController.updateGuest);
router.patch('/:id', guestController.updateGuest);
router.delete('/:id', guestController.deleteGuest);
router.put('/:id/attendance', guestController.markAttendance);
router.put('/:id/emailstatus', guestController.markEmailSent);
router.put('/:id/reminder-date', guestController.updateReminderEmailDate);
export default router;
