import { Response } from 'express';
import Task from '../../models/task.model';
import Event from '../../models/event.model';
import { AuthRequest } from '../../types/auth.types';

// Define filter interface
interface TaskFilter {
  eventId?: string | { $in: string[] };
  status?: string;
}

// Get all tasks (with optional filtering)
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, status } = req.query;

    // Get the current user's ID from the auth token
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // First, get all events owned by the current user
    const userEvents = await Event.find({ ownerId: userId }, '_id');
    const userEventIds = userEvents.map((event) => event._id.toString());

    // Build filter object
    const filter: TaskFilter = {};

    if (eventId && typeof eventId === 'string') {
      // If a specific event ID is provided, make sure it belongs to the user
      if (!userEventIds.includes(eventId)) {
        res.status(403).json({ message: 'Access denied to this event' });
        return;
      }
      filter.eventId = eventId;
    } else {
      // If no specific event ID is provided, filter by all user's events
      filter.eventId = { $in: userEventIds };
    }

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    // Find tasks with filtering
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    // Get event details for each task - but use a more efficient approach
    // First, collect all unique event IDs
    const eventIds = [...new Set(tasks.map((task) => task.eventId.toString()))];

    // Then fetch all events in a single query
    const events = await Event.find({ _id: { $in: eventIds } }, 'title');

    // Create a map of event ID to event data for quick lookup
    const eventMap = events.reduce((map, event) => {
      map[event._id.toString()] = { _id: event._id.toString(), title: event.title };
      return map;
    }, {} as Record<string, { _id: string; title: string }>);

    // Now map tasks with event data
    const tasksWithEventDetails = tasks.map((task) => {
      const eventId = task.eventId.toString();
      const event = eventMap[eventId];

      return {
        ...task.toObject(),
        event: event || undefined,
      };
    });

    // Return the array directly
    res.status(200).json(tasksWithEventDetails);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
};

// Get tasks for a specific event
export const getEventTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check if the event belongs to the current user
    const event = await Event.findOne({ _id: eventId, ownerId: userId });
    if (!event) {
      res.status(403).json({ message: 'Access denied to this event' });
      return;
    }

    const tasks = await Task.find({ eventId }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching event tasks:', error);
    res.status(500).json({ message: 'Failed to fetch event tasks', error });
  }
};

// Get a single task by ID
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check if the task's event belongs to the current user
    const event = await Event.findOne({ _id: task.eventId, ownerId: userId });
    if (!event) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    // Get event details
    const taskWithEvent = {
      ...task.toObject(),
      event: event ? { _id: event._id, title: event.title } : undefined,
    };

    res.status(200).json(taskWithEvent);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task', error });
  }
};

// Create a new task
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const taskData = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validate event exists and belongs to the current user
    const event = await Event.findOne({ _id: eventId, ownerId: userId });
    if (!event) {
      res.status(403).json({ message: 'Access denied to this event' });
      return;
    }

    // Create the task
    const task = new Task({
      ...taskData,
      eventId,
    });

    await task.save();

    // Add task reference to the event
    event.tasks.push(task._id);
    await event.save();

    // Return the task with event info
    const taskWithEvent = {
      ...task.toObject(),
      event: { _id: event._id, title: event.title },
    };

    res.status(201).json({ message: 'Task created successfully', task: taskWithEvent });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task', error });
  }
};

// Update a task
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check if the task's event belongs to the current user
    const event = await Event.findOne({ _id: task.eventId, ownerId: userId });
    if (!event) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { ...updates, updatedAt: new Date() },
      { new: true },
    );

    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found after update' });
      return;
    }

    const taskWithEvent = {
      ...updatedTask.toObject(),
      event: { _id: event._id, title: event.title },
    };

    res.status(200).json({ message: 'Task updated successfully', task: taskWithEvent });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error });
  }
};

// Update task status (for drag and drop functionality)
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

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check if the task's event belongs to the current user
    const event = await Event.findOne({ _id: task.eventId, ownerId: userId });
    if (!event) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    // Update the task status
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        status,
        isCompleted: status === 'finished',
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found after update' });
      return;
    }

    const taskWithEvent = {
      ...updatedTask.toObject(),
      event: { _id: event._id, title: event.title },
    };

    res.status(200).json({ message: 'Task status updated successfully', task: taskWithEvent });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Failed to update task status', error });
  }
};

// Delete a task
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Check if the task's event belongs to the current user
    const event = await Event.findOne({ _id: task.eventId, ownerId: userId });
    if (!event) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    // Remove the task
    await Task.findByIdAndDelete(taskId);

    // Remove the task reference from the event
    await Event.findByIdAndUpdate(task.eventId, { $pull: { tasks: taskId } });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error });
  }
};
