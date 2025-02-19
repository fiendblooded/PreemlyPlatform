import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { checkScopes } from '../middleware/check-scopes';
import { verifyUser } from '../middleware/auth';

const router = Router();

router.post('/', verifyUser, eventController.createEvent);
router.get('/', verifyUser, checkScopes(['read:events']), eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.put('/:id/poster', eventController.updateEventPoster);
router.delete('/:id', eventController.deleteEvent);
router.put('/:id/guests', eventController.updateEventGuests);
router.put('/:id/guests/import', eventController.uploadGuestsFromExcel);

export default router;

