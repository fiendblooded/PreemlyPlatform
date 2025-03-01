import type { Types } from 'mongoose';

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface Task {
  title: string;
  isCompleted: boolean;
  dueDate: Date;
}

export interface WelcomeScreenParams {
  backgroundColor: string;
  textColor: string;
  isManualCheckin: boolean;
  isGdpr: boolean;
  videoUrl: string;
}
export interface EmailExtraModule {
  enabled: boolean;
  content: string;
}
export interface EmailParams {
  parking: EmailExtraModule;
  scheduleSrc: EmailExtraModule;
  dining: EmailExtraModule;
}

export interface Event {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  ownerId: string;
  poster: string;
  guests: Types.ObjectId[];
  date: Date;
  eventType: string;
  endDate: Date;
  location: Location;
  tasks: Task[];
  welcomeScreenParams: WelcomeScreenParams;
  emailParams: EmailParams;
  invoices: Types.ObjectId[];
}
