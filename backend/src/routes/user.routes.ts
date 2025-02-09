import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyUser } from '../middleware/auth';

const router = Router();

router.get('/', verifyUser, userController.getUsers);
router.get('/:id', verifyUser, userController.getUserById);
router.delete('/:id', verifyUser, userController.deleteUser);

export default router;

