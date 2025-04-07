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
  lastStatusChangeDate: Date;
} 