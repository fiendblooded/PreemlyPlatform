import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import type { AuthRequest } from '../types/auth.types';
import dotenv from 'dotenv';

dotenv.config();

const auth0Domain = process.env.AUTH0_M2M_DOMAIN;
const audience = 'https://api.preemly.eu';

if (!auth0Domain || !audience) {
  throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE must be defined in the environment variables.');
}

const client = jwksRsa({
  jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
});

export const verifyUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided',
    });
  }

  const getSigningKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
    client.getSigningKey(header.kid as string, (err, key) => {
      if (err) {
        console.error('Error getting signing key:', err);
        return callback(err);
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  };

  jwt.verify(
    token,
    getSigningKey,
    {
      audience,
      issuer: `https://${auth0Domain}/`,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err);
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid token',
        });
      }
      req.user = decoded as AuthRequest['user'];
      next();
    },
  );
};