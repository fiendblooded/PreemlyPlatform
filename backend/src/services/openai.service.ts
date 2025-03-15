/* eslint-disable max-len */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { InvoiceAnalysis } from '../types/event.types';

dotenv.config();

// Define more specific types for invoice data

// Define the OpenAI chat message type
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ReviewAnalysis {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface StructuredFeedbackItem {
  guestName: string;
  answers: {
    question: string;
    answer: string;
    type: string;
  }[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeInvoices = async (invoiceTexts: string[]): Promise<InvoiceAnalysis> => {
  try {
    const systemPrompt = `You are an AI assistant specialized in financial analysis for event planning. 
        Your task is to analyze invoice data and provide meaningful insights.
        You will receive text extracted from PDF invoices along with structured data about each invoice.
        Analyze this data and provide a comprehensive financial analysis in JSON format.
        Pay special attention to dates and amounts to generate accurate monthly spending data.`;

    const userPromptTemplate = `Analyze these invoices and extract key financial insights.
        
        Invoice Data: {invoiceData}
        
        Invoice Texts: {invoiceTexts}
        
        Please analyze the invoices and extract the following information:
        
        1. Budget Summary: Calculate the total spend, number of invoices, how many are paid vs. unpaid.
           If there's any budget information, calculate the variance (amount and percentage).
        
        2. Cost Breakdown: Categorize expenses and calculate the amount and percentage for each category.
           Identify the top 3 spending categories.
           List vendors with their total amounts and number of invoices.
           Identify any recurring expenses.
        
        3. Performance Insights: If possible, calculate metrics like cost per attendee, cost per lead,
           profitability estimates, and any year-over-year trends.
        
        4. Monthly Spending: Group the invoices by month and calculate the total spending for each month.
           Format should be an array of objects with 'month' (in 'YYYY-MM' format) and 'amount' properties.
        
        5. Due Dates: Extract due dates from invoices and create a list of upcoming payments.
           Include the invoice title, amount, and ID for each due date.
        
        Return your analysis as a valid JSON object with this structure:
        {
          "budgetSummary": {
            "totalSpend": number,
            "budgetVariance": { "amount": number, "percentage": number } (if possible),
            "invoiceCount": number,
            "paidInvoices": number,
            "unpaidInvoices": number
          },
          "costBreakdown": {
            "categories": [{ "category": string, "amount": number, "percentage": number }],
            "topCategories": [string, string, string],
            "vendors": [{ "vendor": string, "amount": number, "invoiceCount": number }],
            "recurringExpenses": [string] (if possible)
          },
          "performanceInsights": {
            "costPerAttendee": number (if possible),
            "costPerLead": number (if possible),
            "profitabilityEstimate": number (if possible),
            "costComparison": string (if possible),
            "yearOverYearTrend": string (if possible),
            "peakSpendingPeriods": [string] (if possible),
            "monthlySpending": [{ "month": string, "amount": number }] (group by month in YYYY-MM format)
          },
          "dueDates": [
            { 
              "date": string (in YYYY-MM-DD format), 
              "title": string, 
              "amount": number, 
              "id": string 
            }
          ]
        }
        
        If any data point cannot be determined, use null or omit it. 
        For string values that can't be determined, use "N/A".
        
        IMPORTANT: Do not make up or generate any data. Only use the information provided in the invoices.
        For the monthlySpending data, use the date field from the invoice data to group by month.
        If an invoice doesn't have a date, exclude it from the monthly spending calculation.
        For dueDates, extract any due date information from the invoices and format as YYYY-MM-DD.`;

    const userPrompt = userPromptTemplate.replace('{invoiceTexts}', JSON.stringify(invoiceTexts));

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    // Make the actual API call to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const analysisText = response.choices[0].message.content;
    if (!analysisText) {
      throw new Error('No analysis received from OpenAI');
    }

    try {
      const analysis = JSON.parse(analysisText) as InvoiceAnalysis;

      // If OpenAI didn't provide monthly spending data, generate it ourselves
      //   if (
      //     !analysis.performanceInsights?.monthlySpending ||
      //     analysis.performanceInsights.monthlySpending.length < 2
      //   ) {
      //     const monthlySpendingData = extractMonthlySpendingData(invoiceData);

      //     if (monthlySpendingData.length >= 2) {
      //       if (!analysis.performanceInsights) {
      //         analysis.performanceInsights = {};
      //       }
      //       analysis.performanceInsights.monthlySpending = monthlySpendingData;
      //     }
      //   }

      return analysis;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse analysis from OpenAI');
    }
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    throw error;
  }
};

export const analyzeReviews = async (reviews: string[]): Promise<ReviewAnalysis> => {
  try {
    const systemPrompt = `You are an AI assistant specialized in analyzing customer reviews. 
        Your task is to analyze the provided reviews and provide a comprehensive overview.
        Identify the main strengths, weaknesses, and provide actionable suggestions for improvement.
        Your response should be in English and structured as a JSON object.`;

    const userPromptTemplate = `Analyze these customer reviews and provide a detailed overview.
        
        Reviews: {reviews}
        
        Please analyze the reviews and extract the following information:
        
        1. Overview: A summary of the overall sentiment and key points from the reviews.
        
        2. Strengths: A list of the main strengths mentioned in the reviews.
        
        3. Weaknesses: A list of the main weaknesses mentioned in the reviews.
        
        4. Suggestions: A list of actionable suggestions for improvement based on the reviews.
        
        Return your analysis as a valid JSON object with this structure:
        {
          "overview": string,
          "strengths": string[],
          "weaknesses": string[],
          "suggestions": string[]
        }
        
        If any data point cannot be determined, use null or omit it. 
        For string values that can't be determined, use "N/A".
        
        IMPORTANT: Do not make up or generate any data. Only use the information provided in the reviews.`;

    const userPrompt = userPromptTemplate.replace('{reviews}', JSON.stringify(reviews));

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const analysisText = response.choices[0].message.content;
    if (!analysisText) {
      throw new Error('No analysis received from OpenAI');
    }

    try {
      const analysis = JSON.parse(analysisText) as ReviewAnalysis;
      return analysis;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse analysis from OpenAI');
    }
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    throw error;
  }
};

export const rewriteEventDescription = async (description: string): Promise<string> => {
  try {
    const systemPrompt = `You are an AI assistant specialized in event marketing and copywriting.
        Your task is to rewrite event descriptions to make them more engaging, exciting, and appealing.
        Maintain the core information but enhance the language, tone, and structure to create excitement.
        Use vivid language, emotional appeals, and compelling calls to action.
        Keep the same general length as the original description.
        
        IMPORTANT: Return ONLY the rewritten description as plain text without any prefixes, 
        explanations, or formatting. Do not include phrases like "Here's your rewritten description:" 
        or any other commentary.`;

    const userPrompt = `Please rewrite the following event description to make it more engaging: 
        
        Original Description: ${description}
        
        Make it exciting, vivid, and compelling while maintaining all the key information.
        Return ONLY the rewritten description text without any additional commentary.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const rewrittenText = response.choices[0]?.message?.content?.trim() || 'Failed to generate description';

    return rewrittenText;
  } catch (error) {
    console.error('Error rewriting event description:', error);
    throw new Error('Failed to rewrite event description');
  }
};

export const analyzeStructuredFeedback = async (
  feedback: StructuredFeedbackItem[],
): Promise<ReviewAnalysis> => {
  try {
    const systemPrompt = `You are an AI assistant specialized in analyzing structured feedback from event attendees. 
        Your task is to analyze the provided feedback and provide a comprehensive overview.
        The feedback is structured with questions and answers of different types (text, rating, choice, ranking).
        Identify the main strengths, weaknesses, and provide actionable suggestions for improvement.
        Your response should be in English and structured as a JSON object.`;

    const userPromptTemplate = `Analyze this structured feedback from event attendees and provide a detailed overview.
        
        Structured Feedback: {feedback}
        
        Please analyze the feedback and extract the following information:
        
        1. Overview: A summary of the overall sentiment and key points from the feedback.
        
        2. Strengths: A list of the main strengths mentioned in the feedback.
        
        3. Weaknesses: A list of the main weaknesses mentioned in the feedback.
        
        4. Suggestions: A list of actionable suggestions for improvement based on the feedback.
        
        Return your analysis as a valid JSON object with this structure:
        {
          "overview": string,
          "strengths": string[],
          "weaknesses": string[],
          "suggestions": string[]
        }
        
        If any data point cannot be determined, use null or omit it. 
        For string values that can't be determined, use "N/A".
        
        IMPORTANT: Do not make up or generate any data. Only use the information provided in the feedback.
        Pay special attention to the different question types and how they should be interpreted:
        - text: Free-form text responses
        - rating: Numerical ratings (typically 0-10)
        - single_choice/multiple_choice: Selected options from a list
        - ranking: Items ranked in order of preference`;

    const userPrompt = userPromptTemplate.replace('{feedback}', JSON.stringify(feedback));

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const analysisText = response.choices[0].message.content;
    if (!analysisText) {
      throw new Error('No analysis received from OpenAI');
    }

    try {
      const analysis = JSON.parse(analysisText) as ReviewAnalysis;
      return analysis;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse analysis from OpenAI');
    }
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    throw error;
  }
};
