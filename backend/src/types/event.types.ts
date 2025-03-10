import type { Types } from 'mongoose';
// Import the Task type but don't use it directly in this file
// import { Task } from './task.types';

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

// Remove the Task interface since we're now importing it from task.types.ts
// export interface Task {
//   title: string;
//   isCompleted: boolean;
//   dueDate: Date;
// }

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

export interface ScheduleItem {
  id: number;
  title: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  icon: string;
  description?: string;
  time?: string;
}

export interface ScheduleModule extends EmailExtraModule {
  items?: ScheduleItem[];
}

export interface SponsorDeal {
  id: number;
  title: string;
  description?: string;
  imageSrc: string;
  linkUrl: string;
}

export interface SponsorDealsModule extends EmailExtraModule {
  items?: SponsorDeal[];
}

export interface EmailParams {
  parking: EmailExtraModule;
  scheduleSrc: ScheduleModule;
  dining: EmailExtraModule;
  sponsorDeals: SponsorDealsModule;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface VendorBreakdown {
  vendor: string;
  amount: number;
  invoiceCount: number;
}

export interface InvoiceAnalysis {
  budgetSummary: {
    totalSpend: number;
    budgetVariance?: {
      amount: number;
      percentage: number;
    };
    invoiceCount: number;
    paidInvoices: number;
    unpaidInvoices: number;
  };
  costBreakdown: {
    categories: CategoryBreakdown[];
    topCategories: string[];
    vendors: VendorBreakdown[];
    recurringExpenses?: string[];
  };
  performanceInsights?: {
    costPerAttendee?: number;
    costPerLead?: number;
    profitabilityEstimate?: number;
    costComparison?: string;
    yearOverYearTrend?: string;
    peakSpendingPeriods?: string[];
    monthlySpending?: {
      month: string;
      amount: number;
    }[];
  };
  dueDates?: {
    date: string;
    title: string;
    amount?: number;
    id: string;
  }[];
  lastUpdated: Date;
}

export interface Feedback {
  guestName?: string;
  content: string;
  createdAt: Date;
}

export interface FeedbackAnalysis {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  lastUpdated: Date;
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
  tasks: Types.ObjectId[];
  welcomeScreenParams: WelcomeScreenParams;
  emailParams: EmailParams;
  invoices?: Types.ObjectId[];
  invoiceAnalysis?: InvoiceAnalysis;
  feedback?: Feedback[];
  feedbackAnalysis?: FeedbackAnalysis;
}
