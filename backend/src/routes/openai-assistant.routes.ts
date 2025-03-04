import { Router } from 'express';
import * as openaiAssistantController from '../controllers/openai-assistant.controller';
import { verifyUser } from '../middleware/auth';

const router = Router();

// Route for processing event descriptions with OpenAI
router.post('/event-assistant', verifyUser, openaiAssistantController.processEventDescription);

export default router;
