import express from 'express';
import { sendSMSController } from '../controllers/sms.controller';

const router = express.Router();

router.post('/send', sendSMSController);

export default router;
