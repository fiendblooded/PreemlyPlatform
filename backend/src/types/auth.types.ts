import type { Request } from 'express';
import type { SubscriptionLevel } from './subscription.types';

export interface AuthUser {
  sub: string
  scope?: string
  subscriptionLevel?: SubscriptionLevel
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

