import { Response } from 'express';
import { analyzeReviews } from './openai.service';
import Event from '../../models/event.model';
import { AuthRequest } from '../../types/auth.types';
import { subscriptionLimitsService } from '../../services/subscription-limits.service';
import { usageStatsService } from '../../services/usage-stats.service';
import { SubscriptionLevel } from '../../types/subscription.types';

export const analyzeCustomerReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { eventId, reviews } = req.body;

  if (!eventId) {
    res.status(400).json({
      success: false,
      message: 'Event ID is required',
    });
    return;
  }

  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    res.status(400).json({
      success: false,
      message: 'No reviews provided',
    });
    return;
  }

  if (!req?.user?.sub) {
    res.status(401).json({
      success: false,
      message: 'User ID is required',
    });
    return;
  }

  try {
    const auth0Id = req.user.sub;
    const subscriptionLevel = req.user.subscriptionLevel || 'FREE';
    
    const currentReviewsCount = await usageStatsService.getReviewsAnalyzedCount(auth0Id);
    
    const checkResult = subscriptionLimitsService.canAnalyzeReviews(
      subscriptionLevel as SubscriptionLevel, 
      currentReviewsCount
    );
    
    if (!checkResult.allowed) {
      res.status(403).json({
        success: false,
        message: checkResult.message
      });
      return;
    }

    const analysis = await analyzeReviews(reviews);

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    event.feedbackAnalysis = {
      ...analysis,
      lastUpdated: new Date(),
    };

    await event.save();
    
    // Update usage statistics
    await usageStatsService.incrementReviewsAnalyzed(auth0Id, reviews.length);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing reviews:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: errorMessage,
    });
  }
};
