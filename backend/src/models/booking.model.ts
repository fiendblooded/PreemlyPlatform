import mongoose, { Schema } from 'mongoose';
import { IBooking, IClient } from '../types/organization.types';

const ClientSchema = new Schema<IClient>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  comment: { type: String }
});

const BookingSchema = new Schema<IBooking>({
  serviceProvider: { type: Schema.Types.ObjectId, ref: 'ServiceProvider', required: true },
  serviceDate: { type: Date, required: true },
  serviceTime: { type: String, required: true },
  client: { type: ClientSchema, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBooking>('Booking', BookingSchema); 