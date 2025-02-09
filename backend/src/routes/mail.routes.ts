import { Router } from 'express';
import { sendMailController } from '../controllers/mail.contoller';

const router = Router();

router.post('/', sendMailController);

export default router;

