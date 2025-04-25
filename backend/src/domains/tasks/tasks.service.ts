import Task from '../../models/task.model';
import Event from '../../models/event.model';
import { Document, Types } from 'mongoose';
import { ITask, ITaskFilter, ITaskResponse } from '../../types/task.types';

interface IEvent {
  _id: Types.ObjectId;
  title: string;
  ownerId: string;
  tasks: Types.ObjectId[];
}

type TaskDocument = Document & ITask;
type EventDocument = Document & IEvent;

export class TasksService {
  async getUserEventIds(userId: string): Promise<string[]> {
    const userEvents = await Event.find({ ownerId: userId }, '_id');
    return userEvents.map((event) => event._id.toString());
  }

  async getTasksWithEventDetails(filter: ITaskFilter): Promise<ITaskResponse[]> {
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    const eventIds = [...new Set(tasks.map((task) => task.eventId.toString()))];
    const events = await Event.find({ _id: { $in: eventIds } }, 'title');

    const eventMap = events.reduce((map, event) => {
      map[event._id.toString()] = { _id: event._id.toString(), title: event.title };
      return map;
    }, {} as Record<string, { _id: string; title: string }>);

    return tasks.map((task) => {
      const eventId = task.eventId.toString();
      const event = eventMap[eventId];
      
      const taskObj = task.toObject();
      
      return {
        ...taskObj,
        _id: taskObj._id.toString(),
        eventId: taskObj.eventId.toString(),
        dueDate: taskObj.dueDate?.toISOString(),
        createdAt: taskObj.createdAt?.toISOString(),
        updatedAt: taskObj.updatedAt?.toISOString(),
        event: event ? { _id: event._id, title: event.title } : undefined,
      } as ITaskResponse;
    });
  }

  async getEventById(eventId: string, userId: string): Promise<EventDocument | null> {
    return await Event.findOne({ _id: eventId, ownerId: userId });
  }

  async getTasksByEventId(eventId: string): Promise<TaskDocument[]> {
    return await Task.find({ eventId }).sort({ createdAt: -1 });
  }

  async getTaskById(taskId: string): Promise<TaskDocument | null> {
    return await Task.findById(taskId);
  }

  async createTask(eventId: string, taskData: Omit<ITask, '_id' | 'eventId'>): Promise<ITaskResponse> {
    const task = new Task({
      ...taskData,
      eventId,
    });

    await task.save();

    const event = await Event.findById(eventId);
    if (event) {
      event.tasks.push(task._id);
      await event.save();
    }

    const taskObj = task.toObject();
    
    return {
      ...taskObj,
      _id: taskObj._id.toString(),
      eventId: taskObj.eventId.toString(),
      dueDate: taskObj.dueDate?.toISOString(),
      createdAt: taskObj.createdAt?.toISOString(),
      updatedAt: taskObj.updatedAt?.toISOString(),
      event: event 
        ? { _id: event._id.toString(), title: event.title } 
        : undefined,
    } as ITaskResponse;
  }

  async updateTask(taskId: string, updates: Partial<ITask>): Promise<ITaskResponse | null> {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { ...updates, updatedAt: new Date() },
      { new: true },
    );

    if (!updatedTask) {
      return null;
    }

    const event = await Event.findById(updatedTask.eventId);
    const taskObj = updatedTask.toObject();
    
    return {
      ...taskObj,
      _id: taskObj._id.toString(),
      eventId: taskObj.eventId.toString(),
      dueDate: taskObj.dueDate?.toISOString(),
      createdAt: taskObj.createdAt?.toISOString(),
      updatedAt: taskObj.updatedAt?.toISOString(),
      event: event 
        ? { _id: event._id.toString(), title: event.title } 
        : undefined,
    } as ITaskResponse;
  }

  async updateTaskStatus(
    taskId: string, 
    status: 'next' | 'inProgress' | 'finished'
  ): Promise<ITaskResponse | null> {
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
      return null;
    }

    const event = await Event.findById(updatedTask.eventId);
    const taskObj = updatedTask.toObject();
    
    return {
      ...taskObj,
      _id: taskObj._id.toString(),
      eventId: taskObj.eventId.toString(),
      dueDate: taskObj.dueDate?.toISOString(),
      createdAt: taskObj.createdAt?.toISOString(),
      updatedAt: taskObj.updatedAt?.toISOString(),
      event: event 
        ? { _id: event._id.toString(), title: event.title } 
        : undefined,
    } as ITaskResponse;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const task = await Task.findById(taskId);
    if (!task) {
      return false;
    }

    await Task.findByIdAndDelete(taskId);
    await Event.findByIdAndUpdate(task.eventId, { $pull: { tasks: taskId } });
    
    return true;
  }
}
