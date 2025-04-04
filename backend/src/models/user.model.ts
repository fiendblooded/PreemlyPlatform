import mongoose, { Schema } from 'mongoose';
import { SubscriptionLevel } from '../types/subscription.types';

export interface User {
  auth0Id: string;
  subscriptionLevel: SubscriptionLevel;
  updatedAt: Date;
}

const UserSchema = new Schema<User>({
  auth0Id: { type: String, required: true, unique: true },
  subscriptionLevel: { 
    type: String, 
    enum: Object.values(SubscriptionLevel),
    default: SubscriptionLevel.FREE
  },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<User>('User', UserSchema); 