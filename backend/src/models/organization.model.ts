import mongoose, { Schema } from 'mongoose';
import { 
  IOrganization, 
  ILocation, 
  IProductCategory,
  IServiceProvider, 
  IServiceDate, 
  IRating 
} from '../types/organization.types';

const LocationSchema = new Schema<ILocation>({
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  placeId: { type: String, required: true },
});

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
}, { _id: true });

const ProductCategorySchema = new Schema<IProductCategory>({
  name: { type: String, required: true },
  products: [ProductSchema],
}, { _id: true });

const ServiceProviderSchema = new Schema<IServiceProvider>({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
}, { _id: true });

const TimeSlotSchema = new Schema({
  time: { type: String, required: true },
  available: { type: Boolean, default: true }
});

const ServiceDateSchema = new Schema<IServiceDate>({
  date: { type: Date, required: true },
  timeSlots: [TimeSlotSchema]
});

const RatingSchema = new Schema<IRating>({
  score: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  clientId: { type: Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now }
});

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  image: { type: String },
  location: { type: LocationSchema, required: true },
  description: { type: String, required: true },
  productCategories: [ProductCategorySchema],
  serviceProviders: [ServiceProviderSchema],
  serviceDates: [ServiceDateSchema],
  bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  ratings: [RatingSchema],
  ownerId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IOrganization>('Organization', OrganizationSchema); 