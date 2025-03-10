import { Request, Response } from 'express';
import Task from '../models/task.model';
import Event from '../models/event.model';

// Define filter interface
interface TaskFilter {
  eventId?: string;
  status?: string;
}

// Get all tasks (with optional filtering)
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, status } = req.query;

    // Build filter object
    const filter: TaskFilter = {};

    if (eventId && typeof eventId === 'string') {
      filter.eventId = eventId;
    }

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    // Find tasks with optional filtering
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
export const getEventTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const tasks = await Task.find({ eventId }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching event tasks:', error);
    res.status(500).json({ message: 'Failed to fetch event tasks', error });
  }
};

// Get a single task by ID
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Get event details
    const event = await Event.findById(task.eventId, 'title');

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
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const taskData = req.body;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
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
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    // Find and update the task
    const task = await Task.findByIdAndUpdate(taskId, { ...updates, updatedAt: new Date() }, { new: true });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Get event details
    const event = await Event.findById(task.eventId, 'title');

    const taskWithEvent = {
      ...task.toObject(),
      event: event ? { _id: event._id, title: event.title } : undefined,
    };

    res.status(200).json({ message: 'Task updated successfully', task: taskWithEvent });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error });
  }
};

// Update task status (for drag and drop functionality)
export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!['next', 'inProgress', 'finished'].includes(status)) {
      res.status(400).json({ message: 'Invalid status value' });
      return;
    }

    // Update the task status and completion status
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        status,
        isCompleted: status === 'finished',
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Get event details
    const event = await Event.findById(task.eventId, 'title');

    const taskWithEvent = {
      ...task.toObject(),
      event: event ? { _id: event._id, title: event.title } : undefined,
    };

    res.status(200).json({ message: 'Task status updated successfully', task: taskWithEvent });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Failed to update task status', error });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    // Find the task to get its eventId
    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
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
