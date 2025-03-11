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
  },
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
  feedback: [
    {
      guestName: { type: String },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
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
