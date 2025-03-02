import OpenAI from 'openai';
import dotenv from 'dotenv';
import { InvoiceAnalysis } from '../types/event.types';

dotenv.config();

// Define more specific types for invoice data
interface InvoiceData {
  id: string;
  title: string;
  amount?: number;
  date?: Date;
  vendor?: string;
  category?: string;
  isPaid: boolean;
}

// Define the OpenAI chat message type
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract monthly spending data directly from invoice data
// This serves as a fallback in case the OpenAI API doesn't return this data
const extractMonthlySpendingData = (invoiceData: InvoiceData[]): { month: string; amount: number }[] => {
  // Create a map to store spending by month
  const monthlySpending = new Map<string, number>();

  // Process each invoice
  invoiceData.forEach((invoice) => {
    if (invoice.amount !== undefined && invoice.date) {
      // Format as YYYY-MM
      const date = new Date(invoice.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Add to existing month or create new entry
      const currentAmount = monthlySpending.get(monthYear) || 0;
      monthlySpending.set(monthYear, currentAmount + invoice.amount);
    }
  });

  // Convert map to array of objects
  return Array.from(monthlySpending.entries()).map(([month, amount]) => ({
    month,
    amount,
  }));
};

export const analyzeInvoices = async (
  invoiceTexts: string[],
  invoiceData: InvoiceData[],
): Promise<InvoiceAnalysis> => {
  try {
    const systemPrompt = `You are an AI assistant specialized in financial analysis for event planning. 
        Your task is to analyze invoice data and provide meaningful insights.
        You will receive text extracted from PDF invoices along with structured data about each invoice.
        Analyze this data and provide a comprehensive financial analysis in JSON format.
        Pay special attention to dates and amounts to generate accurate monthly spending data.`;

    const userPromptTemplate = `I need you to analyze these invoices for my event and provide insights.
        Here's the extracted text from the PDFs:
        {invoiceTexts}
        
        And here's the structured data we have about each invoice:
        {invoiceData}
        
        Please provide a detailed analysis with the following structure:
        1. Budget Summary (totalSpend, budgetVariance if possible, invoiceCount, paidInvoices, unpaidInvoices)
        2. Cost Breakdown (categories with amounts and percentages, top 3 costliest categories, 
           vendor breakdown, recurring expenses)
        3. Performance Insights: (if possible: costPerAttendee, costPerLead, profitabilityEstimate, 
           costComparison, yearOverYearTrend, peakSpendingPeriods)
        4. Monthly Spending: Group the invoices by month and calculate the total spending for each month.
           Format should be an array of objects with 'month' (in 'YYYY-MM' format) and 'amount' properties.
        
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
          }
        }
        
        If any data point cannot be determined, use null or omit it. 
        For string values that can't be determined, use "N/A".
        
        IMPORTANT: Do not make up or generate any data. Only use the information provided in the invoices.
        For the monthlySpending data, use the date field from the invoice data to group by month.
        If an invoice doesn't have a date, exclude it from the monthly spending calculation.`;

    const userPrompt = userPromptTemplate
      .replace('{invoiceTexts}', JSON.stringify(invoiceTexts))
      .replace('{invoiceData}', JSON.stringify(invoiceData));

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
      if (
        !analysis.performanceInsights?.monthlySpending ||
        analysis.performanceInsights.monthlySpending.length < 2
      ) {
        const monthlySpendingData = extractMonthlySpendingData(invoiceData);

        if (monthlySpendingData.length >= 2) {
          if (!analysis.performanceInsights) {
            analysis.performanceInsights = {};
          }
          analysis.performanceInsights.monthlySpending = monthlySpendingData;
        }
      }

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
