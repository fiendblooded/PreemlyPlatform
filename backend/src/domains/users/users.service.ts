import User from '../../models/user.model';
import { SubscriptionLevel } from '../../types/subscription.types';
import mongoose from 'mongoose';

export class UsersService {
  async getUserByAuth0Id(auth0Id: string) {
    return await User.findOne({ auth0Id });
  }

  async createUser(auth0Id: string, subscriptionLevel: SubscriptionLevel = SubscriptionLevel.FREE) {
    const expiresAt = subscriptionLevel === SubscriptionLevel.FREE ? null : this.calculateExpiryDate();
    
    const newUser = new User({
      auth0Id,
      subscriptionLevel,
      updatedAt: new Date(),
      expiresAt
    });
    return await newUser.save();
  }

  async updateSubscriptionLevel(auth0Id: string, subscriptionLevel: SubscriptionLevel) {
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return await this.createUser(auth0Id, subscriptionLevel);
    }
    
    user.subscriptionLevel = subscriptionLevel;
    user.updatedAt = new Date();
    
    user.expiresAt = subscriptionLevel === SubscriptionLevel.FREE ? null : this.calculateExpiryDate();
    
    return await user.save();
  }

  async getUserSubscriptionLevel(auth0Id: string): Promise<SubscriptionLevel> {
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return SubscriptionLevel.FREE;
    }
    
    await this.checkAndUpdateExpiredSubscription(user);
    
    return user.subscriptionLevel;
  }
  private async checkAndUpdateExpiredSubscription(user: mongoose.Document & { 
    expiresAt: Date | null;
    subscriptionLevel: SubscriptionLevel;
    auth0Id: string;
  }) {
    if (user.expiresAt && new Date() > user.expiresAt && user.subscriptionLevel !== SubscriptionLevel.FREE) {
      user.subscriptionLevel = SubscriptionLevel.FREE;
      user.expiresAt = null;
      await user.save();
      console.log(`Подписка пользователя ${user.auth0Id} истекла и была изменена на FREE`);
    }
    return user;
  }

  // Метод для проверки и обновления всех истекших подписок
  async checkAndUpdateExpiredSubscriptions() {
    const currentDate = new Date();
    const expiredUsers = await User.find({
      expiresAt: { $lt: currentDate },
      subscriptionLevel: { $ne: SubscriptionLevel.FREE }
    });
    
    for (const user of expiredUsers) {
      user.subscriptionLevel = SubscriptionLevel.FREE;
      user.expiresAt = null;
      await user.save();
      console.log(`Подписка пользователя ${user.auth0Id} истекла и была изменена на FREE`);
    }
    
    return expiredUsers.length;
  }
  
  // Вспомогательный метод для расчета даты истечения подписки (31 день)
  private calculateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 31);
    return expiryDate;
  }
}
