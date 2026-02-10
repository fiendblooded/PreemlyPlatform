import mongoose, { Schema } from 'mongoose';
import { SubscriptionLevel } from '../types/subscription.types';

export interface IUser {
  auth0Id: string;
  subscriptionLevel: SubscriptionLevel;
  updatedAt: Date;
  lastStatusChangeDate: Date;
  subscriptionEndDate: Date | null;
}

const UserSchema = new Schema<IUser>({
  auth0Id: { type: String, required: true, unique: true },
  subscriptionLevel: { 
    type: String, 
    enum: Object.values(SubscriptionLevel),
    default: SubscriptionLevel.FREE
  },
  updatedAt: { type: Date, default: Date.now },
  lastStatusChangeDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema); 