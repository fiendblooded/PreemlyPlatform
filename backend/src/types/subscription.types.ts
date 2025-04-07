export enum SubscriptionLevel {
  FREE = 'FREE',
  LITE = 'LITE',
  PLUS = 'PLUS',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export const SUBSCRIPTION_GUEST_LIMITS = {
  [SubscriptionLevel.FREE]: 10,
  [SubscriptionLevel.LITE]: 50,
  [SubscriptionLevel.PLUS]: 100,
  [SubscriptionLevel.PREMIUM]: 2000,
  [SubscriptionLevel.ENTERPRISE]: 5000
} as const;

export interface UserSubscription {
  level: SubscriptionLevel;
  updatedAt: Date;
  lastStatusChangeDate: Date;
  subscriptionEndDate: Date | null;
} 