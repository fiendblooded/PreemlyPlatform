export enum SubscriptionLevel {
  FREE = 'FREE',
  LITE = 'LITE',
  PLUS = 'PLUS',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export interface UserSubscription {
  level: SubscriptionLevel;
  updatedAt: Date;
  expiresAt: Date | null;
} 

// Subscription limits for various features
export interface SubscriptionLimits {
  maxGuests: number;           // Maximum number of guests/registrations
  reviewAnalytics: boolean;    // Access to review analytics
  maxReviewsPerMonth?: number; // Maximum number of reviews analyzed per month
  invoiceAnalytics: boolean;   // Access to invoice analytics
  maxInvoicesPerMonth?: number; // Maximum number of invoices analyzed per month
  emailCustomization: string;  // Email customization level
  maxEmails: number;           // Maximum number of emails that can be sent
  hasExtraFeatures: {          // Additional features
    virtualSpaces: boolean;    // Virtual spaces
    archive: boolean;          // Archive
    aiAgent: boolean;          // AI agent
    branding: boolean;         // Branding
    integrations: boolean;     // Integrations
    personalManager: boolean;  // Personal manager
  };
}

// Subscription limit values for each subscription level
export const SUBSCRIPTION_LIMITS: Record<SubscriptionLevel, SubscriptionLimits> = {
  [SubscriptionLevel.FREE]: {
    maxGuests: 10,
    reviewAnalytics: false,
    invoiceAnalytics: false,
    emailCustomization: 'Basic email',
    maxEmails: 10,
    hasExtraFeatures: {
      virtualSpaces: false,
      archive: false,
      aiAgent: false,
      branding: false,
      integrations: false,
      personalManager: false
    }
  },
  [SubscriptionLevel.LITE]: {
    maxGuests: 50,
    reviewAnalytics: false,
    invoiceAnalytics: false,
    emailCustomization: 'Limited customization',
    maxEmails: 50,
    hasExtraFeatures: {
      virtualSpaces: true,
      archive: true,
      aiAgent: false,
      branding: false,
      integrations: false,
      personalManager: false
    }
  },
  [SubscriptionLevel.PLUS]: {
    maxGuests: 100,
    reviewAnalytics: true,
    maxReviewsPerMonth: 5000,
    invoiceAnalytics: true,
    maxInvoicesPerMonth: 300,
    emailCustomization: 'Full customization',
    maxEmails: 200,
    hasExtraFeatures: {
      virtualSpaces: true,
      archive: true,
      aiAgent: true,
      branding: true,
      integrations: false,
      personalManager: false
    }
  },
  [SubscriptionLevel.PREMIUM]: {
    maxGuests: 2000,
    reviewAnalytics: true,
    maxReviewsPerMonth: 15000,
    invoiceAnalytics: true,
    maxInvoicesPerMonth: 1000,
    emailCustomization: 'Branded email',
    maxEmails: 500,
    hasExtraFeatures: {
      virtualSpaces: true,
      archive: true,
      aiAgent: true,
      branding: true,
      integrations: true,
      personalManager: false
    }
  },
  [SubscriptionLevel.ENTERPRISE]: {
    maxGuests: 5000,
    reviewAnalytics: true,
    maxReviewsPerMonth: Number.MAX_SAFE_INTEGER, // No limit
    invoiceAnalytics: true,
    maxInvoicesPerMonth: 10000,
    emailCustomization: 'Personal manager',
    maxEmails: 1000,
    hasExtraFeatures: {
      virtualSpaces: true,
      archive: true,
      aiAgent: true,
      branding: true,
      integrations: true,
      personalManager: true
    }
  }
}; 