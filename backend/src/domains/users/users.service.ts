import User from '../../models/user.model';
import { SubscriptionLevel } from '../../types/subscription.types';

export class UsersService {
  async getUserByAuth0Id(auth0Id: string) {
    return await User.findOne({ auth0Id });
  }

  async createUser(auth0Id: string, subscriptionLevel: SubscriptionLevel = SubscriptionLevel.FREE) {
    const newUser = new User({
      auth0Id,
      subscriptionLevel,
      updatedAt: new Date()
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
    return await user.save();
  }

  async getUserSubscriptionLevel(auth0Id: string): Promise<SubscriptionLevel> {
    const user = await User.findOne({ auth0Id });
    return user?.subscriptionLevel || SubscriptionLevel.FREE;
  }
}
