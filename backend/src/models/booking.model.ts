import mongoose, { Schema } from 'mongoose';
import { IBooking } from '../types/organization.types';

const BookingSchema = new Schema<IBooking>({
  serviceProvider: { type: Schema.Types.ObjectId, required: true },
  serviceDate: { type: Date, required: true },
  serviceTime: { type: String, required: true },
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  products: [{ type: Schema.Types.ObjectId }],
  totalAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add index for faster querying
BookingSchema.index({ client: 1 });
BookingSchema.index({ serviceProvider: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
