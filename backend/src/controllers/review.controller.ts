import { Request, Response } from 'express';
import { analyzeReviews } from '../services/openai.service';

export const analyzeCustomerReviews = async (req: Request, res: Response): Promise<void> => {
  const { reviews } = req.body;

  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    res.status(400).json({
      success: false,
      message: 'No reviews provided',
    });
    return;
  }

  try {
    const analysis = await analyzeReviews(reviews);

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