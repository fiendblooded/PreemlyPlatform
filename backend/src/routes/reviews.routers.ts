import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { verifyUser } from '../middleware/auth';

const router = Router();

router.post('/', verifyUser, reviewController.analyzeCustomerReviews);

export default router;
