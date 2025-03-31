import { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the event data interface
interface EventData {
  title: string;
  date?: string;
  location?: string;
  type?: string;
  description?: string;
  [key: string]: string | undefined;
}

// Process event description with OpenAI
export const processEventDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, existingEventData } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Create system prompt
    const systemPrompt = `You are an AI assistant specialized in event planning. 
    Your task is to extract structured event information from user messages.
    Extract the following information:
    - Event title (REQUIRED - always provide a title even if you need to 
      generate one based on other information)
    - Date
    - Location
    - Event type (e.g., conference, wedding, party)
    - Description
    
    Return the information in JSON format with the following structure:
    {
      "title": "Event title",
      "date": "Event date in ISO format (YYYY-MM-DD)",
      "location": "Event location",
      "type": "Event type",
      "description": "Event description"
    }
    
    IMPORTANT: For the date field, always use ISO format (YYYY-MM-DD) like "2023-12-31". 
    Do not use any other date format.
    If the date is ambiguous or incomplete, make a reasonable assumption and format it as YYYY-MM-DD.
    
    IMPORTANT: Always include a title field in your response. If the user doesn't specify a title, 
    create one based on the description or other information provided.
    
    If any other information is not provided, omit that field from the JSON.
    If the user is modifying existing event data, only include the fields that should be updated.`;

    // Create user prompt
    let userPrompt = `Extract event information from this message: "${message}"`;

    // If there's existing event data, include it in the prompt
    if (existingEventData) {
      userPrompt += `\n\nExisting event data: ${JSON.stringify(existingEventData)}`;
      // eslint-disable-next-line quotes
      userPrompt += "\n\nOnly include fields that should be updated based on the user's message.";
    }

    // Make the API call to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      res.status(500).json({ error: 'No response from OpenAI' });
      return;
    }

    try {
      // Parse the JSON response
      const eventData = JSON.parse(content) as EventData;

      // Ensure there's a title field
      if (!eventData.title) {
        // Generate a title based on description or other fields
        if (eventData.description) {
          // Extract key words from the description to create a title
          const words = eventData.description.split(' ');
          if (words.length <= 3) {
            eventData.title = eventData.description;
          } else {
            // Create a title from the first few words
            eventData.title = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
          }
        } else if (eventData.type) {
          eventData.title = `${eventData.type.charAt(0).toUpperCase() + eventData.type.slice(1)} Event`;
        } else if (eventData.location) {
          eventData.title = `Event at ${eventData.location}`;
        } else if (eventData.date) {
          eventData.title = `Event on ${eventData.date}`;
        } else {
          eventData.title = 'New Event';
        }
      }

      // Return the extracted event data
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
