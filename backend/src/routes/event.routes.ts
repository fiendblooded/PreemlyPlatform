import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { checkScopes } from '../middleware/check-scopes';
import { verifyUser } from '../middleware/auth';
import multer from 'multer';
import * as invoiceController from '../controllers/invoice.controller';
import * as invoiceAnalysisController from '../controllers/invoice-analysis.controller';
import * as feedbackAnalysisController from '../controllers/feedback-analysis.controller';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// Event routes
router.post('/', verifyUser, eventController.createEvent);
router.get('/', verifyUser, checkScopes(['read:events']), eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', verifyUser, eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.put('/:id/poster', verifyUser, eventController.updateEventPoster);
router.put('/:id/guests', verifyUser, eventController.updateEventGuests);
router.put('/:id/guests/import', verifyUser, eventController.uploadGuestsFromExcel);
router.get('/:id/guests/export', verifyUser, eventController.downloadGuestsToExcel);
router.post('/:id/feedback', eventController.addEventFeedback);
router.get('/:id/invoices', verifyUser, invoiceController.getEventInvoices);
router.post('/:id/invoices', verifyUser, upload.single('invoice'), invoiceController.uploadInvoice);
router.delete('/invoices/:id', verifyUser, invoiceController.deleteInvoice);
router.post('/:id/invoices/analyze', verifyUser, invoiceAnalysisController.analyzeEventInvoices);
router.post('/:id/feedback/analyze', verifyUser, feedbackAnalysisController.analyzeEventFeedback);

// Add a new route for uploading sponsor deal images
router.post('/sponsor-deal-image', verifyUser, eventController.uploadSponsorDealImage);

// Task routes
router.get('/:eventId/tasks', eventController.getEventTasks);
router.post('/:eventId/tasks', verifyUser, eventController.addEventTask);
router.put('/:eventId/tasks/:taskId', verifyUser, eventController.updateEventTask);
router.delete('/:eventId/tasks/:taskId', verifyUser, eventController.deleteEventTask);
router.patch('/:eventId/tasks/:taskId/status', verifyUser, eventController.updateTaskStatus);

export default router;
