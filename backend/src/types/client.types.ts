import { Document, Types } from 'mongoose';

export interface IClient extends IClientData, Document {
  attendance_status: boolean;
  email_sent: boolean;
  reminder_email_date?: Date;
  team_id?: string;
  eventId?: Types.ObjectId;
  gdpr_consent?: boolean;
  bookings?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  comment?: string;
  attendance_status?: boolean;
  gdpr_consent?: boolean;
  eventId?: Types.ObjectId | string;
}
