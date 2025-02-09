import mongoose, { Schema, model } from 'mongoose';
import type { Event } from '../types/event.types';

const eventSchema = new Schema<Event>({
  title: { type: String, required: true },
  description: { type: String },
  ownerId: { type: String, required: true },
  poster: { type: String },
  guests: [{ type: Schema.Types.ObjectId, ref: 'Guest' }],
  date: { type: Date, required: true },
  eventType: { type: String, default: 'Offline' },
  endDate: { type: Date, required: true },
  location: {
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    placeId: { type: String },
  },
  tasks: [
    {
      title: { type: String },
      isCompleted: { type: Boolean },
      dueDate: { type: Date },
    },
  ],
  welcomeScreenParams: {
    backgroundColor: { type: String },
    textColor: { type: String },
    isManualCheckin: { type: Boolean },
    isGdpr: { type: Boolean },
    videoUrl: { type: String },
  },
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
});

export default model<Event>('Event', eventSchema);

