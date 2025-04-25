import { Router } from 'express';
import * as userController from './users.controller';
import { verifyUser } from '../../middleware/auth';

const router = Router();

router.get('/', verifyUser, userController.getUsers);

router.post('/subscription', userController.updateSubscriptionLevel);
router.post('/subscription/test', userController.updateSubscriptionLevelTest);
router.get('/subscription', verifyUser, userController.getUserSubscription);

router.get('/:id', verifyUser, userController.getUserById);

router.delete('/:id', verifyUser, userController.deleteUser);

router.patch('/:id/name', verifyUser, userController.updateUserName);

export default router;
