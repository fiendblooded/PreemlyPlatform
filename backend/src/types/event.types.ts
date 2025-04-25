import type { Types } from 'mongoose';
import { ITask } from './task.types';

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
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
  customHtmlTemplate?: {
    enabled: boolean;
    content: string;
  };
  parking: EmailExtraModule;
  scheduleSrc: ScheduleModule;
  dining: EmailExtraModule;
  sponsorDeals: SponsorDealsModule;
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

export enum FeedbackQuestionType {
  TEXT = 'text',
  RATING = 'rating',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  RANKING = 'ranking',
}

export interface FeedbackQuestionOption {
  id: string;
  text: string;
}

export interface FeedbackQuestion {
  id: string;
  title: string;
  type: FeedbackQuestionType;
  required: boolean;
  options?: FeedbackQuestionOption[]; // For choice and ranking questions
  minRating?: number; // For rating questions (default 0)
  maxRating?: number; // For rating questions (default 10)
  minLabel?: string; // Label for the lowest rating
  maxLabel?: string; // Label for the highest rating
}

export interface FeedbackForm {
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

export interface Feedback {
  _id?: string;
  guestName?: string;
  guestEmail?: string;
  answers: IFeedbackItem[];
  createdAt: Date;
}

export interface FeedbackAnalysis {
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
  location: Location;
  tasks: Types.ObjectId[];
  welcomeScreenParams: WelcomeScreenParams;
  emailParams: EmailParams;
  invoices?: Types.ObjectId[];
  invoiceAnalysis?: InvoiceAnalysis;
  feedbackForm?: FeedbackForm;
  feedback?: Feedback[];
  feedbackAnalysis?: FeedbackAnalysis;
}

export interface IEventData {
  title: string;
  description?: string;
  poster?: string;
  date?: string;
  endDate?: string;
  eventType?: string;
  location?: Location;
  tasks?: ITask[];
  welcomeScreenParams?: WelcomeScreenParams;
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
