import type { Types } from 'mongoose';
import { ITask } from './task.types';

export interface ILocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface IWelcomeScreenParams {
  backgroundColor: string;
  textColor: string;
  isManualCheckin: boolean;
  isGdpr: boolean;
  videoUrl: string;
}

export interface IEmailExtraModule {
  enabled: boolean;
  content: string;
}

export interface IScheduleItem {
  id: number;
  title: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  icon: string;
  description?: string;
  time?: string;
}

export interface IScheduleModule extends IEmailExtraModule {
  items?: IScheduleItem[];
}

export interface SponsorDeal {
  id: number;
  title: string;
  description?: string;
  imageSrc: string;
  linkUrl: string;
}

export interface ISponsorDealsModule extends IEmailExtraModule {
  items?: SponsorDeal[];
}

export interface EmailParams {
  customHtmlTemplate?: {
    enabled: boolean;
    content: string;
  };
  parking: IEmailExtraModule;
  scheduleSrc: IScheduleModule;
  dining: IEmailExtraModule;
  sponsorDeals: ISponsorDealsModule;
  virtualSpace?: {
    enabled: boolean;
  };
  emailIdentifier?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface IVendorBreakdown {
  vendor: string;
  amount: number;
  invoiceCount: number;
}

export interface IInvoiceAnalysis {
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
    vendors: IVendorBreakdown[];
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

export enum FeedbackQuestionType {
  TEXT = 'text',
  RATING = 'rating',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  RANKING = 'ranking',
}

export interface IFeedbackQuestionOption {
  id: string;
  text: string;
}

export interface FeedbackQuestion {
  id: string;
  title: string;
  type: FeedbackQuestionType;
  required: boolean;
  options?: IFeedbackQuestionOption[]; // For choice and ranking questions
  minRating?: number; // For rating questions (default 0)
  maxRating?: number; // For rating questions (default 10)
  minLabel?: string; // Label for the lowest rating
  maxLabel?: string; // Label for the highest rating
}

export interface IFeedbackForm {
  title: string;
  description?: string;
  questions: FeedbackQuestion[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeedbackItem {
  questionId: string;
  textAnswer?: string;
  ratingAnswer?: number;
  selectedOptions?: string[]; // IDs of selected options
  rankingOrder?: string[]; // IDs of options in ranked order
}

export interface IFeedback {
  _id?: string;
  guestName?: string;
  guestEmail?: string;
  answers: IFeedbackItem[];
  createdAt: Date;
}

export interface IFeedbackAnalysis {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  lastUpdated: Date;
}

export interface IEvent {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  ownerId: string;
  poster: string;
  guests: Types.ObjectId[];
  date: Date;
  eventType: string;
  endDate: Date;
  location: ILocation;
  tasks: Types.ObjectId[];
  welcomeScreenParams: IWelcomeScreenParams;
  emailParams: EmailParams;
  invoices?: Types.ObjectId[];
  invoiceAnalysis?: IInvoiceAnalysis;
  feedbackForm?: IFeedbackForm;
  feedback?: IFeedback[];
  feedbackAnalysis?: IFeedbackAnalysis;
}

export interface IEventData {
  title: string;
  description?: string;
  poster?: string;
  date?: string;
  endDate?: string;
  eventType?: string;
  location?: ILocation;
  tasks?: ITask[];
  welcomeScreenParams?: IWelcomeScreenParams;
  emailParams?: EmailParams;
}

export interface IFeedbackData {
  guestName?: string;
  guestEmail?: string;
  answers: IFeedbackItem[];
}

export interface IEventFeedback {
  guestName?: string;
  guestEmail?: string;
  answers: IFeedbackItem[];
  createdAt: Date;
}

export interface IEventFeedbackType {
  guestName?: string;
  guestEmail?: string;
  answers: Array<{
    questionId: string;
    textAnswer?: string;
    ratingAnswer?: number;
    selectedOptions?: string[];
    rankingOrder?: string[];
  }>;
}
