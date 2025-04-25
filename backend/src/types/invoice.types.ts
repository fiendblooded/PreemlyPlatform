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

export interface IInvoiceData {
  title?: string;
  amount?: number;
  date?: string | Date;
  vendor?: string;
  category?: string;
  isPaid?: boolean;
  status?: string;
  [key: string]: string | number | boolean | Date | undefined;
}
