import type { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { UsersService } from './users.service';
import { SubscriptionLevel } from '../../types/subscription.types';
import { AuthRequest } from '../../types/auth.types';
import { SUBSCRIPTION_API_KEY, ALLOWED_TILDA_ORIGINS } from '../../index';
import { usageStatsService } from '../../services/usage-stats.service';
import { subscriptionLimitsService } from '../../services/subscription-limits.service';

const usersService = new UsersService();

dotenv.config();
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;

    const query = req.query.q ? `users?q=${encodeURIComponent(JSON.stringify(req.query.q))}` : 'users';
    const response = await axios.get(`https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/${query}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;
    const userId = req.params.id;

    const response = await axios.get(
      `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;
    const userId = req.params.id;

    await axios.delete(`https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.json({
      success: true,
      message: `User ${userId} deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const updateUserName = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Request an access token from Auth0
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Extract user ID and new name from the request
    const userId = req.params.id; // User ID should be passed in the request URL
    const { name } = req.body; // New name should be sent in the request body

    if (!name) {
      res.status(400).json({ success: false, message: 'Name is required.' });
      return;
    }

    // 3. Send request to Auth0 Management API to update the user's profile
    const updateResponse = await axios.patch(
      `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      {
        user_metadata: { displayName: name },
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    // 4. Return success response
    res.json({ success: true, data: updateResponse.data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating name:', {
      message: error.message,
      response: error.response?.data || 'No response data',
      status: error.response?.status || 'No status',
      headers: error.response?.headers || 'No headers',
    });

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const updateSubscriptionLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    const referer = req.headers.referer || '';
    const origin = req.headers.origin || '';
    
    const hasValidApiKey = apiKey === SUBSCRIPTION_API_KEY;
    const hasValidOrigin = ALLOWED_TILDA_ORIGINS.some(
      allowed => referer.includes(allowed) || origin.includes(allowed)
    );
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!hasValidApiKey || (isProduction && !hasValidOrigin)) {
      const reason = !hasValidApiKey ? 'invalid API key' : 'unauthorized origin';
      console.warn(`Attempt to update subscription with ${reason}`);
      
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
      return;
    }
    
    const { userId, subscriptionLevel } = req.body;
    
    if (!userId || !subscriptionLevel || !Object.values(SubscriptionLevel).includes(subscriptionLevel)) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required data in the correct format',
      });
      return;
    }
    
    const originInfo = origin || referer || 'unknown';
    console.log(`Subscription update: User=${userId}, Level=${subscriptionLevel}, Origin=${originInfo}`);
    
    const updatedUser = await usersService.updateSubscriptionLevel(userId, subscriptionLevel);
    
    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating subscription level:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const getUserSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req?.user?.sub) {
      res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }
    
    const subscriptionLevel = await usersService.getUserSubscriptionLevel(req.user.sub);
    
    res.json({
      success: true,
      data: { subscriptionLevel },
    });
  } catch (error) {
    console.error('Error getting subscription level:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const getSubscriptionLimits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req?.user?.sub) {
      res.status(401).json({
        success: false,
        message: 'Authorization required',
      });
      return;
    }
    
    const subscriptionLevel = req.user.subscriptionLevel || 'FREE';
    const auth0Id = req.user.sub;
    
    // Get subscription limits information
    const limitsInfo = subscriptionLimitsService.getLimitsInfo(subscriptionLevel as SubscriptionLevel);
    
    // Get usage statistics
    const currentStats = await Promise.all([
      usageStatsService.getEventStats(auth0Id),
      usageStatsService.getReviewsAnalyzedCount(auth0Id),
      usageStatsService.getInvoicesAnalyzedCount(auth0Id),
      usageStatsService.getEmailsSentCount(auth0Id)
    ]);
    
    const [eventStats, reviewsCount, invoicesCount, emailsCount] = currentStats;
    
    res.json({
      success: true,
      data: {
        subscriptionLevel,
        limits: limitsInfo,
        currentUsage: {
          events: eventStats.eventsCreated,
          guests: eventStats.guestsTotal,
          reviewsAnalyzed: reviewsCount,
          invoicesAnalyzed: invoicesCount,
          emailsSent: emailsCount
        }
      },
    });
  } catch (error) {
    console.error('Error getting subscription limits:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
