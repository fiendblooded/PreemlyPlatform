import { Schema, model } from 'mongoose';
import { Guest } from '../types/guest.types';

const guestSchema = new Schema<Guest>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  phoneNumber: { type: String, default: '' },
  attendance_status: { type: Boolean, default: false },
  email_sent: { type: Boolean, default: false },
  team_id: { type: String },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
});

export default model<Guest>('Guest', guestSchema);

