import { Router } from 'express';
import * as eventsController from './events.controller';
import { checkScopes } from '../../middleware/check-scopes';
import { verifyUser } from '../../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Event CRUD routes
router.post('/', verifyUser, eventsController.createEvent);
router.get('/', verifyUser, checkScopes(['read:events']), eventsController.getEvents);
router.get('/:id', eventsController.getEventById);
router.put('/:id', verifyUser, eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);

// Event poster routes
router.put('/:id/poster', verifyUser, eventsController.updateEventPoster);

// Guest routes
router.put('/:id/guests', verifyUser, eventsController.updateEventGuests);
router.put('/:id/guests/import', verifyUser, eventsController.uploadGuestsFromExcel);
router.get('/:id/guests/export', verifyUser, eventsController.downloadGuestsToExcel);

// Feedback routes
router.post('/:id/feedback', eventsController.addEventFeedback);
router.get('/:id/feedback-form', verifyUser, eventsController.getFeedbackForm);
router.put('/:id/feedback-form', verifyUser, eventsController.updateFeedbackForm);

// Invoice routes
router.get('/:id/invoices', verifyUser, eventsController.getEventInvoices);
router.post('/:id/invoices', verifyUser, upload.single('invoice'), eventsController.uploadInvoice);
router.delete('/invoices/:id', verifyUser, eventsController.deleteInvoice);
router.post('/:id/invoices/analyze', verifyUser, eventsController.analyzeEventInvoices);

// Analysis routes
router.post('/:id/feedback/analyze', verifyUser, eventsController.analyzeEventFeedback);

// OpenAI Assistant routes
router.post('/event-assistant', verifyUser, eventsController.processEventDescriptionWithAI);

// Review Analysis routes
router.post('/reviews/analyze', verifyUser, eventsController.analyzeEventReviews);

// Other routes
router.post('/rewrite-description', verifyUser, eventsController.rewriteDescription);
router.post('/sponsor-deal-image', verifyUser, eventsController.uploadSponsorDealImage);
router.post('/upload-sleep-video', verifyUser, upload.single('video'), eventsController.uploadSleepVideo);

// Task routes
router.get('/:eventId/tasks', eventsController.getEventTasks);
router.post('/:eventId/tasks', verifyUser, eventsController.addEventTask);
router.put('/:eventId/tasks/:taskId', verifyUser, eventsController.updateEventTask);
router.delete('/:eventId/tasks/:taskId', verifyUser, eventsController.deleteEventTask);
router.patch('/:eventId/tasks/:taskId/status', verifyUser, eventsController.updateTaskStatus);

export default router;
