import { Response } from 'express';
import { AuthRequest } from '../../types/auth.types';
import { TasksService } from './tasks.service';
import { ITaskFilter } from '../../types/task.types';

const tasksService = new TasksService();

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, status } = req.query;

    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userEventIds = await tasksService.getUserEventIds(userId);
    const filter: ITaskFilter = {};

    if (eventId && typeof eventId === 'string') {
      if (!userEventIds.includes(eventId)) {
        res.status(403).json({ message: 'Access denied to this event' });
        return;
      }
      filter.eventId = eventId;
    } else {
      filter.eventId = { $in: userEventIds };
    }

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    const tasksWithEventDetails = await tasksService.getTasksWithEventDetails(filter);

    res.status(200).json(tasksWithEventDetails);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
};

export const getEventTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const event = await tasksService.getEventById(eventId, userId);
    if (!event) {
      res.status(403).json({ message: 'Access denied to this event' });
      return;
    }

    const tasks = await tasksService.getTasksByEventId(eventId);
    
    const formattedTasks = tasks.map(task => {
      const taskObj = task.toObject();
      return {
        ...taskObj,
        _id: taskObj._id.toString(),
        eventId: taskObj.eventId.toString(),
        dueDate: taskObj.dueDate?.toISOString(),
        createdAt: taskObj.createdAt?.toISOString(),
        updatedAt: taskObj.updatedAt?.toISOString(),
      };
    });

    res.status(200).json(formattedTasks);
  } catch (error) {
    console.error('Error fetching event tasks:', error);
    res.status(500).json({ message: 'Failed to fetch event tasks', error });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await tasksService.getTaskById(taskId);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const event = await tasksService.getEventById(task.eventId.toString(), userId);
    if (!event) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    const taskObj = task.toObject();
    const taskWithEvent = {
      ...taskObj,
      _id: taskObj._id.toString(),
      eventId: taskObj.eventId.toString(),
      dueDate: taskObj.dueDate?.toISOString(),
      createdAt: taskObj.createdAt?.toISOString(),
      updatedAt: taskObj.updatedAt?.toISOString(),
      event: { _id: event._id.toString(), title: event.title },
    };

    res.status(200).json(taskWithEvent);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task', error });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const taskData = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const event = await tasksService.getEventById(eventId, userId);
    if (!event) {
      res.status(403).json({ message: 'Access denied to this event' });
      return;
    }

    const task = await tasksService.createTask(eventId, taskData);

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await tasksService.getTaskById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const event = await tasksService.getEventById(task.eventId.toString(), userId);
    if (!event) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    const updatedTask = await tasksService.updateTask(taskId, updates);

    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found after update' });
      return;
    }

    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!['next', 'inProgress', 'finished'].includes(status)) {
      res.status(400).json({ message: 'Invalid status value' });
      return;
    }

    const task = await tasksService.getTaskById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const event = await tasksService.getEventById(task.eventId.toString(), userId);
    if (!event) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    const updatedTask = await tasksService.updateTaskStatus(taskId, status);

    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found after update' });
      return;
    }

    res.status(200).json({ message: 'Task status updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Failed to update task status', error });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await tasksService.getTaskById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const event = await tasksService.getEventById(task.eventId.toString(), userId);
    if (!event) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    const deleted = await tasksService.deleteTask(taskId);
    
    if (!deleted) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error });
  }
};
