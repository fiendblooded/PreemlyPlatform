import { Router } from 'express';
import * as openaiAssistantController from './openai-wrapper.controller';
import { verifyUser } from '../../middleware/auth';

const router = Router();

router.post('/event-assistant', verifyUser, openaiAssistantController.processEventDescription);

export default router;
