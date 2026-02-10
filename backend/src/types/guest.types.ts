import type { Document } from 'mongoose';


export interface IGuest extends IGuestData, Document {
  age?: number;
  phoneNumber?: string;
  attendance_status: boolean;
  email_sent: boolean;
  reminder_email_date?: Date;
  team_id?: string;
  eventId?: string;
  gdpr_consent?: boolean;
}

export interface IGuestData {
  fullName: string;
  email: string;
  age?: number;
  phoneNumber?: string;
  attendance_status?: boolean;
  gdpr_consent?: boolean;
} 