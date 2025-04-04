export enum SubscriptionLevel {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export interface UserSubscription {
  level: SubscriptionLevel;
  updatedAt: Date;
} 