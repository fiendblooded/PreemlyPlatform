// backend/src/routes/mail.routes.ts
import { Router } from 'express';
import {
  sendMailController,
  scheduleReminderEmailsController,
  getScheduledEmailsController,
  updateEmailStatusController,
} from '../controllers/mail.controller';

const router = Router();

router.post('/', sendMailController);
router.post('/schedule-reminders', scheduleReminderEmailsController);
router.post('/update-status', updateEmailStatusController);
router.get('/scheduled-emails/:eventId', getScheduledEmailsController);

export default router;
