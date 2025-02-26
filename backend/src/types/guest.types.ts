import type { Document } from 'mongoose';

export interface GuestData {
  fullName: string;
  email: string;
}

export interface Guest extends GuestData, Document {
  age?: number;
  phoneNumber?: string;
  attendance_status: boolean;
  email_sent: boolean;
  reminder_email_date?: Date;
  team_id?: string;
  eventId?: string;
}
