import User, { IUser } from '../../models/user.model';
import { SubscriptionLevel } from '../../types/subscription.types';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class UsersService {
  async getUserByAuth0Id(auth0Id: string) {
    return await User.findOne({ auth0Id });
  }

  async createUser(
    auth0Id: string, 
    subscriptionLevel: SubscriptionLevel = SubscriptionLevel.FREE
  ): Promise<IUser> {
    const user = new User({
      auth0Id,
      subscriptionLevel,
      updatedAt: new Date(),
      lastStatusChangeDate: new Date()
    });

    await user.save();

    return user;
  }

  async updateSubscriptionLevel(
    auth0Id: string, 
    subscriptionLevel: SubscriptionLevel, 
    subscriptionEndDate?: Date
  ): Promise<IUser> {
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return await this.createUser(auth0Id, subscriptionLevel);
    }

    const now = new Date();
    
    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      user.subscriptionLevel = SubscriptionLevel.FREE;
      user.subscriptionEndDate = null;
    } else {
      user.subscriptionLevel = subscriptionLevel;
      if (subscriptionEndDate) {
        user.subscriptionEndDate = subscriptionEndDate;
      }
    }
    
    user.updatedAt = new Date();
    user.lastStatusChangeDate = new Date();
    await user.save();

    return user;
  }

  async setSubscriptionPeriod(auth0Id: string, months: number): Promise<IUser> {
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      throw new Error('User is not found');
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + months);
    
    user.subscriptionEndDate = endDate;
    return await user.save();
  }

  async getUserSubscriptionLevel(auth0Id: string): Promise<SubscriptionLevel> {
    const user = await User.findOne({ auth0Id });

    if (!user) {
      return SubscriptionLevel.FREE;
    }

    const now = new Date();

    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      user.subscriptionLevel = SubscriptionLevel.FREE;
      user.subscriptionEndDate = null;
      await user.save();
    }

    return user.subscriptionLevel;
  }

  async getAuth0Token(): Promise<string> {
    try {
      const tokenResponse = await axios.post(`https://${process.env.AUTH0_M2M_DOMAIN}/oauth/token`, {
        client_id: process.env.AUTH0_M2M_CLIENT_ID,
        client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_M2M_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
      });
      
      return tokenResponse.data.access_token;
    } catch (error) {
      console.error('Error getting Auth0 token:', error);
      throw new Error('Failed to get Auth0 access token');
    }
  }
}
