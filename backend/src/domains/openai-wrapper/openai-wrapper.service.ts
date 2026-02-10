import OpenAI from 'openai';
import dotenv from 'dotenv';
import { IEventData } from '../../types/openai-wrapper.types';
import { IChatMessage } from '../../types/review.types';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIWrapperService {
  async processEventDescription(message: string, existingEventData?: IEventData): Promise<IEventData> {
    const systemPrompt = `You are an AI assistant specialized in event planning. 
    Your task is to extract structured event information from user messages.
    Extract the following information:
    - Event title (REQUIRED - always provide a title even if you need to 
      generate one based on other information)
    - Date
    - ILocation
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

    let userPrompt = `Extract event information from this message: "${message}"`;

    if (existingEventData) {
      userPrompt += `\n\nExisting event data: ${JSON.stringify(existingEventData)}`;
      userPrompt += '\n\nOnly include fields that should be updated based on the user\'s message.';
    }

    const messages: IChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const eventData = JSON.parse(content) as IEventData;

    if (!eventData.title) {
      if (eventData.description) {
        const words = eventData.description.split(' ');
        if (words.length <= 3) {
          eventData.title = eventData.description;
        } else {
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

    return eventData;
  }
}
