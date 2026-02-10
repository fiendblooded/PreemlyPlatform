import { Router } from 'express';
import * as eventsController from './events.controller';
import { checkScopes } from '../../middleware/check-scopes';
import { verifyUser } from '../../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', verifyUser, eventsController.createEvent);
router.get('/', verifyUser, checkScopes(['read:events']), eventsController.getEvents);
router.get('/summary', verifyUser, checkScopes(['read:events']), eventsController.getEventsSummary);
router.get('/:id', eventsController.getEventById);
router.put('/:id', verifyUser, eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

router.put('/:id/poster', verifyUser, eventsController.updateEventPoster);

router.put('/:id/guests', verifyUser, eventsController.updateEventGuests);
router.put('/:id/guests/import', verifyUser, eventsController.uploadGuestsFromExcel);
router.get('/:id/guests/export', verifyUser, eventsController.downloadGuestsToExcel);

router.post('/:id/feedback', eventsController.addEventFeedback);
router.get('/:id/feedback-form', verifyUser, eventsController.getFeedbackForm);
router.put('/:id/feedback-form', verifyUser, eventsController.updateFeedbackForm);

router.post('/:id/feedback/analyze', verifyUser, eventsController.analyzeEventFeedback);

router.post('/event-assistant', verifyUser, eventsController.processEventDescriptionWithAI);

router.post('/reviews/analyze', verifyUser, eventsController.analyzeEventReviews);

router.post('/rewrite-description', verifyUser, eventsController.rewriteDescription);
router.post('/sponsor-deal-image', verifyUser, eventsController.uploadSponsorDealImage);
router.post('/upload-sleep-video', verifyUser, upload.single('video'), eventsController.uploadSleepVideo);

router.get('/:eventId/tasks', eventsController.getEventTasks);
router.post('/:eventId/tasks', verifyUser, eventsController.addEventTask);
router.put('/:eventId/tasks/:taskId', verifyUser, eventsController.updateEventTask);
router.delete('/:eventId/tasks/:taskId', verifyUser, eventsController.deleteEventTask);
router.patch('/:eventId/tasks/:taskId/status', verifyUser, eventsController.updateTaskStatus);

export default router;
