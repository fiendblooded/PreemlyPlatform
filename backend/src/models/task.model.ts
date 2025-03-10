import { Schema, model } from 'mongoose';
import { Task } from '../types/task.types';

const taskSchema = new Schema<Task>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['next', 'inProgress', 'finished'],
      default: 'next',
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    assignee: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default model<Task>('Task', taskSchema);
