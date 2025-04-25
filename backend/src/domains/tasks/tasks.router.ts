import { Router } from 'express';
import * as taskController from './tasks.controller';
import { verifyUser } from '../../middleware/auth';

const router = Router();

router.get('/', verifyUser, taskController.getTasks);
router.get('/:taskId', verifyUser, taskController.getTaskById);
router.patch('/:taskId', verifyUser, taskController.updateTask);
router.patch('/:taskId/status', verifyUser, taskController.updateTaskStatus);
router.delete('/:taskId', verifyUser, taskController.deleteTask);
router.get('/event/:eventId', verifyUser, taskController.getEventTasks);
router.post('/event/:eventId', verifyUser, taskController.createTask);

export default router;
