import { Types } from 'mongoose';

export interface Invoice {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  title: string;
  description?: string;
  amount?: number;
  date?: Date;
  vendor?: string;
  category?: string;
  isPaid: boolean;
  pdfUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
