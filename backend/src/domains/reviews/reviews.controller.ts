import { Request, Response } from 'express';
import { analyzeReviews } from './openai.service';
import Event from '../../models/event.model';

export const analyzeCustomerReviews = async (req: Request, res: Response): Promise<void> => {
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

  try {
    const analysis = await analyzeReviews(reviews);

    // Save the analysis to the event
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
