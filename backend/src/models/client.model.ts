import mongoose, { Schema } from 'mongoose';
import { IClient } from '../types/client.types';

const ClientSchema = new Schema<IClient>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  comment: { type: String },
  team_id: { type: String },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  attendance_status: { type: Boolean, default: false },
  email_sent: { type: Boolean, default: false },
  reminder_email_date: { type: Date, default: null },
  gdpr_consent: { type: Boolean, default: false },
  bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add index for faster querying
ClientSchema.index({ email: 1 });
ClientSchema.index({ eventId: 1 });

export default mongoose.model<IClient>('Client', ClientSchema);
