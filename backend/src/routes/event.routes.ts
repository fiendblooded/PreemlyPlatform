import { Router } from 'express';
import { verifyUser } from '../middleware/auth';
import * as eventController from '../controllers/event.controller';
import { checkScopes } from '../middleware/check-scopes';

const router = Router();

router.post('/', verifyUser, eventController.createEvent);
router.get('/', verifyUser, checkScopes(['read:events']), eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.put('/:id/poster', eventController.updateEventPoster);
router.delete('/:id', eventController.deleteEvent);
router.put('/:id/guests', eventController.updateEventGuests);

export default router;

