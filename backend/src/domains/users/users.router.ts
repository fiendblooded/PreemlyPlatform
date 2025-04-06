import { Router } from 'express';
import * as userController from './users.controller';
import { verifyUser } from '../../middleware/auth';

const router = Router();

// Get all users
router.get('/', verifyUser, userController.getUsers);

// Get user by ID
router.get('/:id', verifyUser, userController.getUserById);

// Delete user by ID
router.delete('/:id', verifyUser, userController.deleteUser);

// Update user's name
router.patch('/:id/name', verifyUser, userController.updateUserName);

// Subscription routes
router.post('/subscription', userController.updateSubscriptionLevel);
router.get('/subscription', verifyUser, userController.getUserSubscription);
router.get('/subscription/limits', verifyUser, userController.getSubscriptionLimits);

export default router;
