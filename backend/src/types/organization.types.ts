import { Types } from 'mongoose';

export interface ILocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface IProduct {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  price: number;
}

export interface IProductCategory {
  _id?: Types.ObjectId;
  name: string;
  products: IProduct[];
}

export interface IServiceProvider {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
}

export interface ITimeSlot {
  time: string;
  available: boolean;
}

export interface IServiceDate {
  _id?: Types.ObjectId;
  date: Date;
  timeSlots: ITimeSlot[];
}

export interface IClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  comment?: string;
}

export interface IBooking {
  _id?: Types.ObjectId;
  serviceProvider: Types.ObjectId | IServiceProvider;
  serviceDate: Date;
  serviceTime: string;
  client: IClient;
  createdAt: Date;
}

export interface IRating {
  _id?: Types.ObjectId;
  score: number; // 1-5
  comment?: string;
  clientId?: Types.ObjectId;
  createdAt: Date;
}

export interface IOrganization {
  _id?: Types.ObjectId;
  name: string;
  image?: string;
  location: ILocation;
  description: string;
  productCategories: IProductCategory[];
  serviceProviders: IServiceProvider[];
  serviceDates: IServiceDate[];
  bookings: Types.ObjectId[] | IBooking[];
  ratings: IRating[];
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationData {
  name: string;
  image?: string;
  location: ILocation;
  description: string;
  productCategories?: IProductCategory[];
  serviceProviders?: IServiceProvider[];
  serviceDates?: IServiceDate[];
  ownerId: string;
} 