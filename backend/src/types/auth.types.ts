import type { Request } from 'express';

export interface AuthUser {
  sub: string
  scope?: string
}

export interface AuthRequest extends Request {
  user?: AuthUser
}

