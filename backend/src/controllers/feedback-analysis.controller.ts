import { Request, Response } from 'express';
import Event from '../models/event.model';
import { analyzeReviews } from '../services/openai.service';

export const analyzeEventFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

    // Check if the event has feedback
    if (!event.feedback || event.feedback.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No feedback available for analysis',
      });
      return;
    }

    // Extract feedback content
    const feedbackContents = event.feedback.map((feedback) => feedback.content);

    // Analyze the feedback using OpenAI
    const analysis = await analyzeReviews(feedbackContents);

    // Update the event with the analysis results
    event.feedbackAnalysis = {
      ...analysis,
      lastUpdated: new Date(),
    };

    await event.save();

    res.status(200).json({
      success: true,
      data: event.feedbackAnalysis,
    });
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: errorMessage,
    });
  }
};
