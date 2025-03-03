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
  invoices?: Types.ObjectId[];
  invoiceAnalysis?: InvoiceAnalysis;
  feedback?: Feedback[];
}
