import mongoose, { Schema, model } from 'mongoose';
import type { Event } from '../types/event.types';

const eventSchema = new Schema<Event>({
  title: { type: String, required: true },
  description: { type: String },
  ownerId: { type: String, required: true },
  poster: { type: String },
  guests: [{ type: Schema.Types.ObjectId, ref: 'Guest' }],
  date: { type: Date, required: true },
  eventType: { type: String, default: 'Offline' },
  endDate: { type: Date, required: true },
  location: {
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    placeId: { type: String },
  },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  welcomeScreenParams: {
    backgroundColor: { type: String },
    textColor: { type: String },
    isManualCheckin: { type: Boolean },
    isGdpr: { type: Boolean },
    videoUrl: { type: String },
    inactivityTimeout: { type: Number, default: 30 },
    checkinSuccessTimeout: { type: Number, default: 5 },
  },
  emailParams: {
    customHtmlTemplate: {
      enabled: { type: Boolean, default: false },
      content: { type: String },
    },
    parking: {
      enabled: { type: Boolean },
      content: { type: String },
    },
    scheduleSrc: {
      enabled: { type: Boolean },
      content: { type: String },
      items: [
        {
          id: { type: Number },
          title: { type: String },
          time: { type: String },
          location: { type: String },
          icon: { type: String },
          startDateTime: { type: String },
          endDateTime: { type: String },
          description: { type: String },
        },
      ],
    },
    dining: {
      enabled: { type: Boolean },
      content: { type: String },
    },
    sponsorDeals: {
      enabled: { type: Boolean },
      content: { type: String },
      items: [
        {
          id: { type: Number },
          title: { type: String },
          description: { type: String },
          imageSrc: { type: String },
          linkUrl: { type: String },
        },
      ],
    },
    virtualSpace: {
      enabled: { type: Boolean, default: false },
    },
  },
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
  feedback: [
    {
      guestName: { type: String },
      guestEmail: { type: String },
      answers: [
        {
          questionId: { type: String, required: true },
          textAnswer: { type: String },
          ratingAnswer: { type: Number },
          selectedOptions: [{ type: String }],
          rankingOrder: [{ type: String }],
        },
      ],
      createdAt: { type: Date, default: Date.now },
    },
  ],
  feedbackForm: {
    title: { type: String, default: 'Event Feedback' },
    description: { type: String },
    questions: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        type: {
          type: String,
          required: true,
          enum: ['text', 'rating', 'single_choice', 'multiple_choice', 'ranking'],
          default: 'text',
        },
        required: { type: Boolean, default: false },
        options: [
          {
            id: { type: String },
            text: { type: String },
          },
        ],
        minRating: { type: Number, default: 0 },
        maxRating: { type: Number, default: 10 },
        minLabel: { type: String },
        maxLabel: { type: String },
      },
    ],
    isEnabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  invoiceAnalysis: {
    budgetSummary: {
      totalSpend: { type: Number },
      budgetVariance: {
        amount: { type: Number },
        percentage: { type: Number },
      },
      invoiceCount: { type: Number },
      paidInvoices: { type: Number },
      unpaidInvoices: { type: Number },
    },
    costBreakdown: {
      categories: [
        {
          category: { type: String },
          amount: { type: Number },
          percentage: { type: Number },
        },
      ],
      topCategories: [{ type: String }],
      vendors: [
        {
          vendor: { type: String },
          amount: { type: Number },
          invoiceCount: { type: Number },
        },
      ],
      recurringExpenses: [{ type: String }],
    },
    performanceInsights: {
      costPerAttendee: { type: Number },
      costPerLead: { type: Number },
      profitabilityEstimate: { type: Number },
      costComparison: { type: String },
      yearOverYearTrend: { type: String },
      peakSpendingPeriods: [{ type: String }],
      monthlySpending: [
        {
          month: { type: String },
          amount: { type: Number },
        },
      ],
    },
    dueDates: [
      {
        date: { type: String },
        title: { type: String },
        amount: { type: Number },
        id: { type: String },
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  feedbackAnalysis: {
    overview: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    lastUpdated: { type: Date },
  },
});

export default model<Event>('Event', eventSchema);
