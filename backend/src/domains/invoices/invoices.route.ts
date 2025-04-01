import { Router } from 'express';
import * as invoicesController from './invoices.controller';
import { verifyUser } from '../../middleware/auth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Invoice routes
router.get('/:id/invoices', verifyUser, invoicesController.getEventInvoices);
router.post('/:id/invoices', verifyUser, upload.single('invoice'), invoicesController.uploadInvoice);
router.delete('/invoices/:id', verifyUser, invoicesController.deleteInvoice);
router.post('/:id/invoices/analyze', verifyUser, invoicesController.analyzeEventInvoices);

export default router;