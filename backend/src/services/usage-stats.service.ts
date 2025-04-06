import UsageStats, { UsageStats as UsageStatsType } from '../models/usage-stats.model';
import { Document } from 'mongoose';

class UsageStatsService {
  /**
   * Gets or creates usage statistics for a user for the current month
   */
  async getUserCurrentStats(auth0Id: string): Promise<UsageStatsType & Document> {
    const date = new Date();
    const month = date.getMonth() + 1; // Months in JS start from 0
    const year = date.getFullYear();
    
    let stats = await UsageStats.findOne({ auth0Id, month, year });
    
    if (!stats) {
      stats = await UsageStats.create({
        auth0Id,
        month,
        year,
        reviewsAnalyzed: 0,
        invoicesAnalyzed: 0,
        emailsSent: 0,
        eventsCreated: 0,
        guestsTotal: 0
      });
    }
    
    return stats;
  }
  
  /**
   * Increments the analyzed reviews counter
   */
  async incrementReviewsAnalyzed(auth0Id: string, count: number = 1): Promise<void> {
    const stats = await this.getUserCurrentStats(auth0Id);
    stats.reviewsAnalyzed += count;
    await stats.save();
  }
  
  /**
   * Increments the analyzed invoices counter
   */
  async incrementInvoicesAnalyzed(auth0Id: string, count: number = 1): Promise<void> {
    const stats = await this.getUserCurrentStats(auth0Id);
    stats.invoicesAnalyzed += count;
    await stats.save();
  }
  
  /**
   * Increments the sent emails counter
   */
  async incrementEmailsSent(auth0Id: string, count: number = 1): Promise<void> {
    const stats = await this.getUserCurrentStats(auth0Id);
    stats.emailsSent += count;
    await stats.save();
  }
  
  /**
   * Increments the created events counter and guests
   */
  async incrementEventStats(auth0Id: string, guestsCount: number = 0): Promise<void> {
    const stats = await this.getUserCurrentStats(auth0Id);
    stats.eventsCreated += 1;
    stats.guestsTotal += guestsCount;
    await stats.save();
  }
  
  /**
   * Gets total number of analyzed reviews for the current month
   */
  async getReviewsAnalyzedCount(auth0Id: string): Promise<number> {
    const stats = await this.getUserCurrentStats(auth0Id);
    return stats.reviewsAnalyzed;
  }
  
  /**
   * Gets total number of analyzed invoices for the current month
   */
  async getInvoicesAnalyzedCount(auth0Id: string): Promise<number> {
    const stats = await this.getUserCurrentStats(auth0Id);
    return stats.invoicesAnalyzed;
  }
  
  /**
   * Gets total number of sent emails for the current month
   */
  async getEmailsSentCount(auth0Id: string): Promise<number> {
    const stats = await this.getUserCurrentStats(auth0Id);
    return stats.emailsSent;
  }
  
  /**
   * Gets statistics for events and guests for the current month
   */
  async getEventStats(auth0Id: string): Promise<{ eventsCreated: number; guestsTotal: number }> {
    const stats = await this.getUserCurrentStats(auth0Id);
    return {
      eventsCreated: stats.eventsCreated,
      guestsTotal: stats.guestsTotal
    };
  }
}

export const usageStatsService = new UsageStatsService(); 