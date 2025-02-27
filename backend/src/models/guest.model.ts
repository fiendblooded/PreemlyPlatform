import mongoose, { Schema } from 'mongoose';
import type { Guest } from '../types/guest.types';

const GuestSchema = new Schema<Guest>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  phoneNumber: { type: String, default: '' },
  attendance_status: { type: Boolean, default: false },
  email_sent: { type: Boolean, default: false },
  reminder_email_date: { type: Date, default: null }, // Add this field
  team_id: { type: String },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  gdpr_consent: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model<Guest>('Guest', GuestSchema);
