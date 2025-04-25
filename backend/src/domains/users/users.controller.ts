import type { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { UsersService } from './users.service';
import { SubscriptionLevel } from '../../types/subscription.types';
import { AuthRequest } from '../../types/auth.types';
import { SUBSCRIPTION_API_KEY, ALLOWED_TILDA_ORIGINS } from '../../index';

const usersService = new UsersService();

dotenv.config();
const AUTH0_API_URL = `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2`;

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const accessToken = await usersService.getAuth0Token();

    const query = req.query.q ? `users?q=${encodeURIComponent(JSON.stringify(req.query.q))}` : 'users';
    const response = await axios.get(`${AUTH0_API_URL}/${query}`, {
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
    const accessToken = await usersService.getAuth0Token();
    const userId = req.params.id;

    const response = await axios.get(
      `${AUTH0_API_URL}/users/${encodeURIComponent(userId)}`,
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
    const accessToken = await usersService.getAuth0Token();
    const userId = req.params.id;

    await axios.delete(`${AUTH0_API_URL}/users/${encodeURIComponent(userId)}`, {
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
    const userId = req.params.id;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Name is required.' });
      return;
    }

    const accessToken = await usersService.getAuth0Token();
    
    const updateResponse = await axios.patch(
      `${AUTH0_API_URL}/users/${encodeURIComponent(userId)}`,
      {
        user_metadata: { displayName: name },
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    res.json({ success: true, data: updateResponse.data });

  } catch (error) {
    console.error('Error updating name:', error);

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
      (allowed) => referer.includes(allowed) || origin.includes(allowed),
    );

    const isProduction = process.env.NODE_ENV === 'production';

    if (!hasValidApiKey || (isProduction && !hasValidOrigin)) {
      const reason = !hasValidApiKey ? 'invalid API key' : 'unauthorized origin';
      console.warn(`Attempt to update subscription with ${reason}`);

      res.status(403).json({
        success: false,
        message: 'Access denied',
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

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const updatedUser = await usersService.updateSubscriptionLevel(
      userId,
      subscriptionLevel,
      subscriptionEndDate,
    );

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating subscription level:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const updateSubscriptionLevelTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, subscriptionLevel } = req.body;

    if (!userId || !subscriptionLevel || !Object.values(SubscriptionLevel).includes(subscriptionLevel)) {
      res.status(400).json({
        success: false,
        message: 'User ID and valid subscription level are required',
      });
      return;
    }

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const updatedUser = await usersService.updateSubscriptionLevel(
      userId,
      subscriptionLevel,
      subscriptionEndDate,
    );

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating subscription level:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getUserSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log('getUserSubscription user:', req?.user?.sub);
  try {
    if (!req?.user?.sub) {
      res.status(401).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const subscriptionLevel = await usersService.getUserSubscriptionLevel(req.user.sub);
    
    if (!subscriptionLevel) {
      res.status(404).json({
        success: false,
        message: 'Subscription information not found',
      });
      return;
    }
    
    const user = await usersService.getUserByAuth0Id(req.user.sub);

    res.json({
      success: true,
      data: {
        userId: req.user.sub,
        subscriptionLevel: subscriptionLevel,
        subscriptionEndDate: user?.subscriptionEndDate || null
      },
    });
  } catch (error) {
    console.error('Error getting subscription info:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
