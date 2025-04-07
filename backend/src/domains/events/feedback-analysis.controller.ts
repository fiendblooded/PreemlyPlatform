/* eslint-disable indent */
import { Response } from 'express';
import { AuthRequest } from '../../types/auth.types';
import Event from '../../models/event.model';
import { analyzeStructuredFeedback } from './openai.service';
import { SubscriptionLevel } from '../../types/subscription.types';
import { UsersService } from '../users/users.service';

const usersService = new UsersService();

export const analyzeEventFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Требуется авторизация',
      });
      return;
    }

    // Проверяем уровень подписки
    const subscriptionLevel = await usersService.getUserSubscriptionLevel(userId);
    const allowedLevels = [SubscriptionLevel.PLUS, SubscriptionLevel.PREMIUM, SubscriptionLevel.ENTERPRISE];
    
    if (!allowedLevels.includes(subscriptionLevel)) {
      res.status(403).json({
        success: false,
        message: 'Анализ отзывов доступен только для подписок PLUS, PREMIUM и ENTERPRISE',
      });
      return;
    }

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

    // Check if the event has a feedback form
    if (!event.feedbackForm || !event.feedbackForm.questions || event.feedbackForm.questions.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No feedback form structure available',
      });
      return;
    }

    // Prepare structured feedback for analysis
    const structuredFeedback = event.feedback.map((feedback) => {
      // Process answers and filter out nulls
      const processedAnswers = [];

      for (const answer of feedback.answers) {
        // Find the corresponding question
        const question = event.feedbackForm?.questions.find((q) => q.id === answer.questionId);
        if (!question) continue;

        let formattedAnswer = '';

        switch (question.type) {
          case 'text':
            formattedAnswer = answer.textAnswer || '';
            break;
          case 'rating':
            formattedAnswer = answer.ratingAnswer?.toString() || '';
            break;
          case 'single_choice':
          case 'multiple_choice':
            if (answer.selectedOptions && answer.selectedOptions.length > 0) {
              const selectedTexts = answer.selectedOptions.map((optionId) => {
                const option = question.options?.find((opt) => opt.id === optionId);
                return option ? option.text : optionId;
              });
              formattedAnswer = selectedTexts.join(', ');
            }
            break;
          case 'ranking':
            if (answer.rankingOrder && answer.rankingOrder.length > 0) {
              const rankedTexts = answer.rankingOrder.map((optionId, index) => {
                const option = question.options?.find((opt) => opt.id === optionId);
                return `${index + 1}. ${option ? option.text : optionId}`;
              });
              formattedAnswer = rankedTexts.join('; ');
            }
            break;
        }

        processedAnswers.push({
          question: question.title,
          answer: formattedAnswer,
          type: question.type as string, // Cast to string to match the interface
        });
      }

      return {
        guestName: feedback.guestName || 'Anonymous',
        answers: processedAnswers,
      };
    });

    // Analyze the feedback using OpenAI
    const analysis = await analyzeStructuredFeedback(structuredFeedback);

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
