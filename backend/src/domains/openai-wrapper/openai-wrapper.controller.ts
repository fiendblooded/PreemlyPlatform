import { Request, Response } from 'express';
import { OpenAIWrapperService } from './openai-wrapper.service';

const openAIWrapperService = new OpenAIWrapperService();

export const processEventDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, existingEventData } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    try {
      const eventData = await openAIWrapperService.processEventDescription(message, existingEventData);
      res.status(200).json({ eventData });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      res.status(500).json({ error: 'Failed to parse event data from OpenAI response' });
    }
  } catch (error) {
    console.error('Error processing event description with OpenAI:', error);
    res.status(500).json({ error: 'Failed to process event description' });
  }
};
