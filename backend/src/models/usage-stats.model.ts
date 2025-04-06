import mongoose, { Schema } from 'mongoose';

export interface UsageStats {
  auth0Id: string;
  month: number; // 1-12
  year: number;
  reviewsAnalyzed: number;
  invoicesAnalyzed: number;
  emailsSent: number;
  eventsCreated: number;
  guestsTotal: number;
}

const UsageStatsSchema = new Schema<UsageStats>({
  auth0Id: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  reviewsAnalyzed: { type: Number, default: 0 },
  invoicesAnalyzed: { type: Number, default: 0 },
  emailsSent: { type: Number, default: 0 },
  eventsCreated: { type: Number, default: 0 },
  guestsTotal: { type: Number, default: 0 }
}, { timestamps: true });

// Create a compound index for fast search by auth0Id, month and year
UsageStatsSchema.index({ auth0Id: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<UsageStats>('UsageStats', UsageStatsSchema); 