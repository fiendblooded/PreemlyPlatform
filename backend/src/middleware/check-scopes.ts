import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.types';

export const checkScopes = (requiredScopes: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const tokenScopes = req.user?.scope?.split(' ') || [];
    const hasRequiredScopes = requiredScopes.every((scope) => tokenScopes.includes(scope));

    if (!hasRequiredScopes) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      });
    }

    next();
  };
};

