import mongoose, { Schema, model } from 'mongoose';
import type { Invoice } from '../types/invoice.types';

const invoiceSchema = new Schema<Invoice>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number },
    date: { type: Date },
    vendor: { type: String },
    category: { type: String },
    isPaid: { type: Boolean, default: false },
    pdfUrl: { type: String, required: true },
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
  },
  { timestamps: true },
);

export default model<Invoice>('Invoice', invoiceSchema);
