import type { Request } from 'express';
import type { SubscriptionLevel } from './subscription.types';

export interface IAuthUser {
  sub: string
  scope?: string
  subscriptionLevel?: SubscriptionLevel
}

export interface AuthRequest extends Request {
  user?: IAuthUser
}

