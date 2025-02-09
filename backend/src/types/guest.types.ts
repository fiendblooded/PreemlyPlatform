import { Types } from 'mongoose';

export interface Guest {
  _id: Types.ObjectId
  fullName: string
  email: string
  age?: number
  phoneNumber: string
  attendance_status: boolean
  email_sent: boolean
  team_id?: string
  eventId: Types.ObjectId
}

