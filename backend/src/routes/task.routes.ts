import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { verifyUser } from '../middleware/auth';

const router = Router();

// Routes for tasks across all events
router.get('/', verifyUser, taskController.getTasks);
router.get('/:taskId', taskController.getTaskById);
router.patch('/:taskId', verifyUser, taskController.updateTask);
router.patch('/:taskId/status', verifyUser, taskController.updateTaskStatus);
router.delete('/:taskId', verifyUser, taskController.deleteTask);

// Routes for tasks within a specific event
// These will be mounted under /events/:eventId/tasks in the main app
router.get('/event/:eventId', taskController.getEventTasks);
router.post('/event/:eventId', verifyUser, taskController.createTask);

export default router;
