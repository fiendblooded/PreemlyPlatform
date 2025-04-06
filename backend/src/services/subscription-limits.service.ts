import { SubscriptionLevel, SUBSCRIPTION_LIMITS } from '../types/subscription.types';

class SubscriptionLimitsService {
  /**
   * Checks if creating an event with specified number of guests is allowed
   * @param subscriptionLevel User's subscription level
   * @param guestsCount Number of guests for the event
   * @returns Object with check result and message
   */
  canCreateEventWithGuests(subscriptionLevel: SubscriptionLevel, guestsCount: number): { allowed: boolean; message?: string } {
    const limits = SUBSCRIPTION_LIMITS[subscriptionLevel];
    const maxGuests = limits.maxGuests;
    
    if (guestsCount <= maxGuests) {
      return { allowed: true };
    }
    
    return { 
      allowed: false, 
      message: `Your current subscription plan ${subscriptionLevel} allows creating events with maximum ${maxGuests} guests. Upgrade your subscription to increase the limit.`
    };
  }
  
  /**
   * Checks if review analysis is available and monthly limit is not exceeded
   * @param subscriptionLevel User's subscription level
   * @param currentMonthCount Current number of analyzed reviews this month
   * @returns Object with check result and message
   */
  canAnalyzeReviews(subscriptionLevel: SubscriptionLevel, currentMonthCount: number = 0): { allowed: boolean; message?: string } {
    const limits = SUBSCRIPTION_LIMITS[subscriptionLevel];
    
    if (!limits.reviewAnalytics) {
      return {
        allowed: false,
        message: `Review analysis is not available on your current subscription plan ${subscriptionLevel}. Upgrade your subscription to access this feature.`
      };
    }
    
    const maxReviews = limits.maxReviewsPerMonth || 0;
    
    if (currentMonthCount >= maxReviews) {
      return {
        allowed: false,
        message: `You have reached the monthly limit for review analysis (${maxReviews}). Upgrade your subscription to increase the limit.`
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Checks if invoice analysis is available and monthly limit is not exceeded
   * @param subscriptionLevel User's subscription level
   * @param currentMonthCount Current number of analyzed invoices this month
   * @returns Object with check result and message
   */
  canAnalyzeInvoices(subscriptionLevel: SubscriptionLevel, currentMonthCount: number = 0): { allowed: boolean; message?: string } {
    const limits = SUBSCRIPTION_LIMITS[subscriptionLevel];
    
    if (!limits.invoiceAnalytics) {
      return {
        allowed: false,
        message: `Invoice analysis is not available on your current subscription plan ${subscriptionLevel}. Upgrade your subscription to access this feature.`
      };
    }
    
    const maxInvoices = limits.maxInvoicesPerMonth || 0;
    
    if (currentMonthCount >= maxInvoices) {
      return {
        allowed: false,
        message: `You have reached the monthly limit for invoice analysis (${maxInvoices}). Upgrade your subscription to increase the limit.`
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Checks if the email sending limit is not exceeded
   * @param subscriptionLevel User's subscription level
   * @param currentCount Current number of sent emails
   * @returns Object with check result and message
   */
  canSendEmail(subscriptionLevel: SubscriptionLevel, currentCount: number): { allowed: boolean; message?: string } {
    const limits = SUBSCRIPTION_LIMITS[subscriptionLevel];
    const maxEmails = limits.maxEmails;
    
    if (currentCount < maxEmails) {
      return { allowed: true };
    }
    
    return {
      allowed: false,
      message: `You have reached the email sending limit (${maxEmails}) for your subscription plan ${subscriptionLevel}. Upgrade your subscription to increase the limit.`
    };
  }
  
  /**
   * Checks if a specific extra feature is available
   * @param subscriptionLevel User's subscription level
   * @param feature Name of the feature to check
   * @returns Object with check result and message
   */
  hasExtraFeature(subscriptionLevel: SubscriptionLevel, feature: keyof typeof SUBSCRIPTION_LIMITS[SubscriptionLevel]['hasExtraFeatures']): { 
    allowed: boolean; 
    message?: string 
  } {
    const limits = SUBSCRIPTION_LIMITS[subscriptionLevel];
    
    if (limits.hasExtraFeatures[feature]) {
      return { allowed: true };
    }
    
    return {
      allowed: false,
      message: `Feature "${feature}" is not available on your current subscription plan ${subscriptionLevel}. Upgrade your subscription to access this feature.`
    };
  }
  
  /**
   * Gets information about available limits for the specified subscription level
   * @param subscriptionLevel Subscription level
   * @returns Object with limits
   */
  getLimitsInfo(subscriptionLevel: SubscriptionLevel) {
    return SUBSCRIPTION_LIMITS[subscriptionLevel];
  }
}

export const subscriptionLimitsService = new SubscriptionLimitsService(); 