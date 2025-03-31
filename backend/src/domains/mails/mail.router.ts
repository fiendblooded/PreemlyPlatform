import { Router } from 'express';
import {
  sendMailController,
  scheduleReminderEmailsController,
  updateEmailStatusController,
  getScheduledEmailsController,
  unsubscribeController
} from './mail.controller';


const router = Router();

router.post('/', sendMailController);
router.post('/schedule-reminders', scheduleReminderEmailsController);
router.post('/update-status', updateEmailStatusController);
router.get('/scheduled-emails/:eventId', getScheduledEmailsController);
router.post('/unsubscribe', unsubscribeController);

export default router;
