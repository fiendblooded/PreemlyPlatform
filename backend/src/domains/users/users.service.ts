import User from '../../models/user.model';
import { SubscriptionLevel } from '../../types/subscription.types';

export class UsersService {
  async getUserByAuth0Id(auth0Id: string) {
    return await User.findOne({ auth0Id });
  }

  async createUser(
    auth0Id: string, 
    subscriptionLevel: SubscriptionLevel = SubscriptionLevel.FREE
  ) {
    const newUser = new User({
      auth0Id,
      subscriptionLevel,
      updatedAt: new Date(),
      lastStatusChangeDate: new Date(),
      subscriptionEndDate: null
    });
    return await newUser.save();
  }

  async updateSubscriptionLevel(
    auth0Id: string, 
    subscriptionLevel: SubscriptionLevel, 
    subscriptionEndDate?: Date
  ) {
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return await this.createUser(auth0Id, subscriptionLevel);
    }

    const now = new Date();
    
    // Проверяем, истек ли срок подписки
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
    return await user.save();
  }

  async setSubscriptionPeriod(auth0Id: string, months: number) {
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      throw new Error('Пользователь не найден');
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

    // Проверяем, не истек ли срок подписки
    const now = new Date();
    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      user.subscriptionLevel = SubscriptionLevel.FREE;
      user.subscriptionEndDate = null;
      await user.save();
    }

    return user.subscriptionLevel;
  }

  async getUserSubscriptionInfo(auth0Id: string) {
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return null;
    }

    // Проверяем, не истек ли срок подписки
    const now = new Date();
    if (user.subscriptionEndDate && user.subscriptionEndDate < now) {
      user.subscriptionLevel = SubscriptionLevel.FREE;
      user.subscriptionEndDate = null;
      await user.save();
    }

    return {
      subscriptionLevel: user.subscriptionLevel,
      subscriptionEndDate: user.subscriptionEndDate,
    };
  }
}
