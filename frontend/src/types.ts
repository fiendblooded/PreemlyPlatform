export type Guest = {
  _id: string;
  fullName: string;
  age: number;
  phoneNumber: string;
  email: string;
  attendance_status?: boolean;
  email_sent?: boolean;
  reminder_email_date?: string; // Add this field
  gdpr_consent?: boolean; // Add this field
};
export type Task = {
  title: string;
  isCompleted: boolean;
  dueDate: string;
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

export type Feedback = {
  guestName?: string;
  content: string;
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
  };
  emailParams: {
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
  };
  tasks: Task[];
  invoices?: Invoice[];
  invoiceAnalysis?: InvoiceAnalysis;
  feedback?: Feedback[];
  feedbackAnalysis?: FeedbackAnalysis;
};
