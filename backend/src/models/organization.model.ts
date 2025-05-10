import mongoose, { Schema } from 'mongoose';
import {
  IOrganization,
  ILocation,
  IProductCategory,
  IServiceProvider,
  IServiceDate,
  IRating,
} from '../types/organization.types';

const LocationSchema = new Schema<ILocation>({
  address: { type: String, required: false },
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  placeId: { type: String, required: false },
});

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
  },
  { _id: true },
);

const ProductCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true },
    products: [ProductSchema],
  },
  { _id: true },
);

const ServiceProviderSchema = new Schema<IServiceProvider>(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
  },
  { _id: true },
);

const TimeSlotSchema = new Schema({
  time: { type: String, required: true },
  available: { type: Boolean, default: true },
});

const ServiceDateSchema = new Schema<IServiceDate>({
  date: { type: Date, required: true },
  timeSlots: [TimeSlotSchema],
});

const RatingSchema = new Schema<IRating>({
  score: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  clientId: { type: Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
});

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    image: { type: String },
    location: { type: LocationSchema, required: false },
    description: { type: String, required: false },
    productCategories: [ProductCategorySchema],
    serviceProviders: [ServiceProviderSchema],
    serviceDates: [ServiceDateSchema],
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    ratings: [RatingSchema],
    ownerId: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);
