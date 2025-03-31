import { Router } from 'express';
import * as reviewController from './reviews.controller';
import { verifyUser } from '../../middleware/auth';

const router = Router();

router.post('/analyze', verifyUser, reviewController.analyzeCustomerReviews);

export default router;
