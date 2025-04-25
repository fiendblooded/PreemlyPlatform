import mongoose, { Schema, model } from 'mongoose';

export interface IScheduledEmail {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  guestId: mongoose.Types.ObjectId;
  recipient: string;
  subject: string;
  htmlContent: string;
  scheduledTime: Date;
  status: 'pending' | 'scheduled' | 'sent' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

const scheduledEmailSchema = new Schema<IScheduledEmail>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    guestId: { type: Schema.Types.ObjectId, ref: 'Guest', required: true },
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    scheduledTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    error: { type: String },
  },
  { timestamps: true },
);

export default model<IScheduledEmail>('IScheduledEmail', scheduledEmailSchema);
