import { Types } from 'mongoose';

export interface ITaskFilter {
  eventId?: string | { $in: string[] };
  status?: string;
}
export interface ITask {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: Date;
  status: 'next' | 'inProgress' | 'finished';
  eventId: Types.ObjectId;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskResponse {
  _id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  status: 'next' | 'inProgress' | 'finished';
  eventId: string;
  event?: {
    _id: string;
    title: string;
  };
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
