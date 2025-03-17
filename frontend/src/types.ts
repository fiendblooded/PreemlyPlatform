export type Guest = {
  _id: string;
  fullName: string;
  age: number;
  phoneNumber: string;
  email: string;
  attendance_status: boolean;
  email_sent: boolean;
  reminder_email_date?: string;
  gdpr_consent: boolean;
};
export type Task = {
  _id?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate: string;
  status: "next" | "inProgress" | "finished";
  eventId: string;
  event?: {
    _id: string;
    title: string;
  };
  assignee?: string;
  priority?: "low" | "medium" | "high";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Invoice = {
  _id: string;
  eventId: string;
  title: string;
  description?: string;
  amount?: number;
  date?: string;
  vendor?: string;
  category?: string;
  isPaid: boolean;
  pdfUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryBreakdown = {
  category: string;
  amount: number;
  percentage: number;
};

export type VendorBreakdown = {
  vendor: string;
  amount: number;
  invoiceCount: number;
};

export type InvoiceAnalysis = {
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
  lastUpdated: string;
};

export type FeedbackQuestionType =
  | "text"
  | "rating"
  | "single_choice"
  | "multiple_choice"
  | "ranking";

export type FeedbackQuestionOption = {
  id: string;
  text: string;
};

export type FeedbackQuestion = {
  id: string;
  title: string;
  type: FeedbackQuestionType;
  required: boolean;
  options?: FeedbackQuestionOption[]; // For choice and ranking questions
  minRating?: number; // For rating questions (default 0)
  maxRating?: number; // For rating questions (default 10)
  minLabel?: string; // Label for the lowest rating
  maxLabel?: string; // Label for the highest rating
};

export type FeedbackForm = {
  title: string;
  description?: string;
  questions: FeedbackQuestion[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FeedbackAnswer = {
  questionId: string;
  textAnswer?: string;
  ratingAnswer?: number;
  selectedOptions?: string[]; // IDs of selected options
  rankingOrder?: string[]; // IDs of options in ranked order
};

export type Feedback = {
  _id?: string;
  guestName?: string;
  guestEmail?: string;
  answers: FeedbackAnswer[];
  createdAt?: string;
};

export type FeedbackAnalysis = {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  lastUpdated: string;
};

export type ScheduleItem = {
  id: number;
  title: string;
  startDateTime: string; // ISO string format
  endDateTime: string; // ISO string format
  location: string;
  icon: string;
  description?: string;
  // Keep time field for backward compatibility, but it will be deprecated
  time?: string;
};

export type SponsorDeal = {
  id: number;
  title: string;
  description?: string;
  imageSrc: string;
  linkUrl: string;
};

export type Event = {
  date: string;
  _id: string;
  title: string;
  ownerId: string;
  description: string;
  guests: Guest[];
  poster: string | null;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    placeId: string;
  };
  endDate: string;
  eventType: string;
  welcomeScreenParams: {
    backgroundColor: string;
    textColor: string;
    isManualCheckin: boolean;
    isGdpr: boolean;
    videoUrl: string;
    inactivityTimeout?: number;
  };
  emailParams: {
    customHtmlTemplate?: {
      enabled: boolean;
      content: string;
    };
    parking: {
      enabled: boolean;
      content: string;
    };
    scheduleSrc: {
      enabled: boolean;
      content: string;
      items?: ScheduleItem[];
    };
    dining: {
      enabled: boolean;
      content: string;
    };
    sponsorDeals: {
      enabled: boolean;
      content: string;
      items?: SponsorDeal[];
    };
  };
  tasks: Task[];
  invoices?: Invoice[];
  invoiceAnalysis?: InvoiceAnalysis;
  feedbackForm?: FeedbackForm;
  feedback?: Feedback[];
  feedbackAnalysis?: FeedbackAnalysis;
};
