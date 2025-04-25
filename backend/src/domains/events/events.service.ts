/* eslint-disable @typescript-eslint/no-explicit-any */
import Event from '../../models/event.model';
import Guest from '../../models/guest.model';
import IInvoice from '../../models/invoice.model';
import cloudinary from '../../config/cloudinary';
import { uploadImage } from '../../config/cloudinary';
import { extractPublicId } from '../../utils/helpers';
import xlsx from 'xlsx';
import { SUBSCRIPTION_GUEST_LIMITS } from '../../types/subscription.types';
import { UsersService } from '../users/users.service';
import mongoose from 'mongoose';
import axios from 'axios';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { 
  IInvoiceAnalysis, 
  IEventData,
  IEventFeedbackType,
  IFeedbackQuestionOption,
  FeedbackQuestion,
  IFeedbackItem
} from '../../types/event.types';
import { IChatMessage, IReviewAnalysis, IStructuredFeedbackItem } from '../../types/review.types';
import { IGuestData } from '../../types/guest.types';
import { ITask } from '../../types/task.types';
import { IInvoiceData } from '../../types/invoice.types';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const usersService = new UsersService();

export class EventsService {
  async extractTextFromPdf(pdfUrl: string): Promise<string> {
    try {
      const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
      });

      const pdfData = await pdfParse(response.data);

      return pdfData.text;
    } catch (error: unknown) {
      console.error('Error extracting text from PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
    }
  }

  async analyzeInvoices(invoiceTexts: string[]): Promise<IInvoiceAnalysis> {
    try {
      const systemPrompt = `You are an AI assistant specialized in financial analysis for event planning. 
          Your task is to analyze invoice data and provide meaningful insights.
          You will receive text extracted from PDF invoices along with structured data about each invoice.
          Analyze this data and provide a comprehensive financial analysis in JSON format.
          Pay special attention to dates and amounts to generate accurate monthly spending data.`;

      const userPromptTemplate = `Analyze these invoices and extract key financial insights.
          
          IInvoice Data: {invoiceData}
          
          IInvoice Texts: {invoiceTexts}
          
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

      const messages: IChatMessage[] = [
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
        const analysis = JSON.parse(analysisText) as IInvoiceAnalysis;
        return analysis;
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse analysis from OpenAI');
      }
    } catch (error) {
      console.error('Error in OpenAI analysis:', error);
      throw error;
    }
  }

  async analyzeReviews(reviews: string[]): Promise<IReviewAnalysis> {
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

      const messages: IChatMessage[] = [
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
        const analysis = JSON.parse(analysisText) as IReviewAnalysis;
        return analysis;
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse analysis from OpenAI');
      }
    } catch (error) {
      console.error('Error in OpenAI analysis:', error);
      throw error;
    }
  }

  async rewriteEventDescription(description: string): Promise<string> {
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
  }

  async analyzeStructuredFeedback(
    feedback: IStructuredFeedbackItem[],
  ): Promise<IReviewAnalysis> {
    try {
      const systemPrompt = `You are an AI assistant specialized in analyzing structured feedback
      from event attendees. 
          Your task is to analyze the provided feedback and provide a comprehensive overview.
          The feedback is structured with questions and answers of different types
          (text, rating, choice, ranking).
          Identify the main strengths, weaknesses, and provide actionable suggestions for improvement.
          Your response should be in English and structured as a JSON object.`;

      const userPromptTemplate = `Analyze this structured feedback from event attendees and provide a
      detailed overview.
          
          Structured IFeedback: {feedback}
          
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

      const messages: IChatMessage[] = [
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
        const analysis = JSON.parse(analysisText) as IReviewAnalysis;
        return analysis;
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse analysis from OpenAI');
      }
    } catch (error) {
      console.error('Error in OpenAI analysis:', error);
      throw error;
    }
  }

  async createEvent(eventData: IEventData, userId: string) {
    let posterUrl = '';

    if (eventData.poster && eventData.poster.trim() !== '') {
      const uploadResponse = await cloudinary.uploader.upload(eventData.poster, {
        folder: 'events_posters',
      });
      posterUrl = uploadResponse.secure_url;
    }

    const newEvent = new Event({
      title: eventData.title,
      description: eventData.description || '',
      ownerId: userId,
      date: eventData.date || '2025-03-20T23:00:23.000+00:00',
      endDate: eventData.endDate || eventData.date || '2025-03-20T23:00:23.000+00:00',
      eventType: eventData.eventType || 'Offline',
      poster: posterUrl,
      location: eventData.location || {
        address: '1600 Amphitheatre Parkway, Mountain View, CA, USA',
        latitude: 37.4224764,
        longitude: -122.0842499,
        placeId: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
      },
      tasks: eventData.tasks || [],
      welcomeScreenParams: eventData.welcomeScreenParams || {
        backgroundColor: '',
        textColor: '',
        isGdpr: false,
        isManualCheckin: true,
        videoUrl: '',
      },
      emailParams: eventData.emailParams || {
        customHtmlTemplate: {
          enabled: false,
          content: '',
        },
        scheduleSrc: {
          enabled: false,
          content: '',
          items: [],
        },
        parking: {
          enabled: false,
          content: '',
        },
        dining: {
          enabled: false,
          content: '',
        },
        sponsorDeals: {
          enabled: false,
          content: '',
          items: [],
        },
        virtualSpace: {
          enabled: false,
        },
      },
    });

    return await newEvent.save();
  }

  async getEvents(userId: string) {
    const events = await Event.find({ ownerId: userId });
    return events;
  }

  async getEventsSummary(userId: string) {
    const events = await Event.find(
      { ownerId: userId },
      '_id title date endDate poster eventType location.address guests',
    );
    return events;
  }

  async getEventById(id: string) {
    return await Event.findById(id).populate('guests');
  }

  async updateEvent(id: string, updateData: Partial<IEventData>) {
    return await Event.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteEvent(id: string) {
    const eventToDelete = await Event.findById(id);
    if (!eventToDelete) return null;

    if (eventToDelete.poster) {
      try {
        const posterPublicId = extractPublicId(eventToDelete.poster);
        await cloudinary.uploader.destroy('events_posters/' + posterPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    return await Event.findByIdAndDelete(id);
  }

  async updateEventPoster(id: string, poster: string) {
    const existingEvent = await Event.findById(id);
    if (!existingEvent) return null;

    if (existingEvent.poster) {
      try {
        const posterPublicId = extractPublicId(existingEvent.poster);
        await cloudinary.uploader.destroy('events_posters/' + posterPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting old image from Cloudinary:', cloudinaryError);
      }
    }

    const uploadResponse = await uploadImage(poster, 'events_posters');

    return await Event.findByIdAndUpdate(id, { poster: uploadResponse.secure_url }, { new: true });
  }

  async updateEventGuests(eventId: string, guests: mongoose.Types.ObjectId[], userId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      return null;
    }

    const subscriptionLevel = await usersService.getUserSubscriptionLevel(userId);
    const guestLimit = SUBSCRIPTION_GUEST_LIMITS[subscriptionLevel];

    if (guests.length > guestLimit) {
      throw new Error(
        `Превышен лимит количества гостей для вашего уровня подписки. 
        Текущий лимит: ${guestLimit} гостей. 
        Попробуйте обновить подписку для увеличения лимита.`,
      );
    }

    event.guests = guests;
    return await event.save();
  }

  private async readGuestsFromExcel(fileBuffer: Buffer): Promise<IGuestData[]> {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as Array<unknown[]>;
    const dataWithoutHeader = data.slice(1);

    if (dataWithoutHeader.length === 0) {
      throw new Error('No guest data found in the Excel file');
    }

    const guests = dataWithoutHeader
      .map((row): IGuestData => ({
        fullName: row[0]?.toString().trim() || '',
        email: row[1]?.toString().trim() || '',
        phoneNumber: row[2]?.toString().trim() || '',
        age: 0,
      }))
      .filter((guest): guest is IGuestData => Boolean(guest.fullName) && Boolean(guest.email));

    return guests;
  }

  async uploadGuestsFromExcel(eventId: string, fileBuffer: Buffer, userId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      return null;
    }

    const guestData = await this.readGuestsFromExcel(fileBuffer);

    const subscriptionLevel = await usersService.getUserSubscriptionLevel(userId);
    const guestLimit = SUBSCRIPTION_GUEST_LIMITS[subscriptionLevel];

    if (guestData.length > guestLimit) {
      throw new Error(
        `Превышен лимит количества гостей для вашего уровня подписки. 
        Текущий лимит: ${guestLimit} гостей. 
        Попробуйте обновить подписку для увеличения лимита.`,
      );
    }

    const createdGuests = await Guest.insertMany(guestData);
    const guestIds = createdGuests.map((guest) => guest._id) as mongoose.Types.ObjectId[];

    event.guests = guestIds;
    return await event.save();
  }

  async downloadGuestsToExcel(id: string) {
    const event = await Event.findById(id).populate('guests');
    if (!event) return null;

    // Cast the guests array to ensure it has the expected properties
    interface PopulatedGuest {
      fullName: string;
      email: string;
      phoneNumber?: string;
      attendance_status: boolean;
      email_sent: boolean;
      gdpr_consent?: boolean;
    }

    const data = event.guests.map((guest: PopulatedGuest) => ({
      'Full Name': guest.fullName,
      Email: guest.email,
      'Phone Number': guest.phoneNumber,
      'Attendance Status': guest.attendance_status,
      'Email Sent': guest.email_sent,
      'GDPR Consent': guest.gdpr_consent,
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Guests');

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async addEventFeedback(id: string, feedbackData: {
    guestName?: string;
    guestEmail?: string;
    answers: IFeedbackItem[];
  }) {
    const event = await Event.findById(id);
    if (!event) return null;

    if (event.feedbackForm && event.feedbackForm.questions) {
      const questionIds = event.feedbackForm.questions.map((q: FeedbackQuestion) => q.id);
      const invalidQuestionIds = feedbackData.answers.filter(
        (a: IFeedbackItem) => !questionIds.includes(a.questionId)
      );

      if (invalidQuestionIds.length > 0) {
        throw new Error('Some question IDs are invalid');
      }
    }

    const feedback = {
      guestName: feedbackData.guestName || undefined,
      guestEmail: feedbackData.guestEmail || undefined,
      answers: feedbackData.answers,
      createdAt: new Date(),
    };

    if (!event.feedback) {
      event.feedback = [];
    }

    event.feedback.push(feedback);
    return await event.save();
  }

  async getFeedbackForm(id: string) {
    const event = await Event.findById(id);
    if (!event) return null;

    return (
      event.feedbackForm || {
        title: 'Event IFeedback',
        description: 'Please share your thoughts about the event',
        questions: [],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  }

  async updateFeedbackForm(id: string, feedbackForm: any) {
    if (!feedbackForm || !feedbackForm.questions || !Array.isArray(feedbackForm.questions)) {
      throw new Error('Invalid feedback form structure');
    }

    const questionIds = feedbackForm.questions.map((q: { id: string }) => q.id);
    if (new Set(questionIds).size !== questionIds.length) {
      throw new Error('All questions must have unique IDs');
    }

    const validTypes = ['text', 'rating', 'single_choice', 'multiple_choice', 'ranking'];
    const invalidQuestions = feedbackForm.questions.filter(
      (q: { type: string; title: string }) => !validTypes.includes(q.type),
    );
    if (invalidQuestions.length > 0) {
      throw new Error('Invalid question type(s)');
    }

    const choiceQuestions = feedbackForm.questions.filter((q: { type: string }) =>
      ['single_choice', 'multiple_choice', 'ranking'].includes(q.type),
    );

    const questionsWithoutOptions = choiceQuestions.filter(
      (q: { options?: IFeedbackQuestionOption[]; title: string }) =>
        !q.options || !Array.isArray(q.options) || q.options.length < 2,
    );

    if (questionsWithoutOptions.length > 0) {
      throw new Error('Choice and ranking questions must have at least 2 options');
    }

    return await Event.findByIdAndUpdate(
      id,
      {
        feedbackForm: {
          ...feedbackForm,
          updatedAt: new Date(),
        },
      },
      { new: true },
    );
  }

  async uploadInvoice(
    id: string, 
    file: Express.Multer.File, 
    invoiceData: IInvoiceData
  ) {
    const event = await Event.findById(id);
    if (!event) return null;

    const base64Data = file.buffer.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64Data}`;
    const filename = file.originalname.replace(/\.pdf$/i, '');

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'raw',
      folder: 'event_invoices',
      public_id: filename,
      access_mode: 'public',
    });

    const pdfUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: 'raw',
      secure: true,
    });

    const invoice = new IInvoice({
      eventId: id,
      title: file.originalname.replace(/\.pdf$/i, ''),
      pdfUrl: pdfUrl,
      amount: invoiceData.amount ? parseFloat(invoiceData.amount.toString()) : undefined,
      date: invoiceData.date ? new Date(invoiceData.date) : new Date(),
      vendor: invoiceData.vendor || undefined,
      category: invoiceData.category || undefined,
      isPaid: invoiceData.isPaid === true || false,
    });

    await invoice.save();
    await Event.findByIdAndUpdate(id, { $push: { invoices: invoice._id } });

    return invoice;
  }

  async getEventInvoices(id: string) {
    return await IInvoice.find({ eventId: id }).sort({ createdAt: -1 });
  }

  async deleteInvoice(id: string) {
    const invoice = await IInvoice.findById(id);
    if (!invoice) return null;

    if (invoice.pdfUrl) {
      try {
        const match = invoice.pdfUrl.match(/event_invoices\/([^/]+)(?:\.[^.]+)?$/);
        const publicId = match ? match[1] : null;

        if (publicId) {
          await cloudinary.uploader.destroy(`event_invoices/${publicId}`, {
            resource_type: 'raw',
          });
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    await Event.findByIdAndUpdate(invoice.eventId, { $pull: { invoices: invoice._id } });
    return await IInvoice.findByIdAndDelete(id);
  }

  async analyzeEventInvoices(id: string) {
    const event = await Event.findById(id);
    if (!event) return null;

    const invoices = await IInvoice.find({ eventId: id });
    if (invoices.length === 0) {
      throw new Error('No invoices found for this event');
    }

    const invoiceTexts: string[] = [];
    const invoiceData = [];

    for (const invoice of invoices) {
      try {
        const text = await this.extractTextFromPdf(invoice.pdfUrl);
        invoiceTexts.push(text);

        invoiceData.push({
          id: invoice._id.toString(),
          title: invoice.title,
          amount: invoice.amount,
          date: invoice.date,
          vendor: invoice.vendor,
          category: invoice.category,
          isPaid: invoice.isPaid,
        });
      } catch (error) {
        console.error(`Error processing invoice ${invoice._id}:`, error);
      }
    }

    if (invoiceTexts.length === 0) {
      throw new Error('Failed to extract text from any invoices');
    }

    const analysis = await this.analyzeInvoices(invoiceTexts);

    event.invoiceAnalysis = {
      ...analysis,
      lastUpdated: new Date(),
    };

    return await event.save();
  }

  async analyzeEventFeedback(id: string) {
    const event = await Event.findById(id);
    if (!event) return null;

    if (!event.feedback || event.feedback.length === 0) {
      throw new Error('No feedback available for analysis');
    }

    if (
      !event.feedbackForm || 
      !event.feedbackForm.questions || 
      event.feedbackForm.questions.length === 0
    ) {
      throw new Error('No feedback form structure available');
    }

    const structuredFeedback = event.feedback.map((feedback: IEventFeedbackType) => {
      const processedAnswers = [];

      for (const answer of feedback.answers) {
        const question = event.feedbackForm?.questions.find(
          (q: FeedbackQuestion) => q.id === answer.questionId
        );
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
            const selectedTexts = answer.selectedOptions.map((optionId: string) => {
              const option = question.options?.find(
                (opt: IFeedbackQuestionOption) => opt.id === optionId
              );
              return option ? option.text : optionId;
            });
            formattedAnswer = selectedTexts.join(', ');
          }
          break;
        case 'ranking':
          if (answer.rankingOrder && answer.rankingOrder.length > 0) {
            const rankedTexts = answer.rankingOrder.map(
              (optionId: string, index: number) => {
                const option = question.options?.find(
                  (opt: IFeedbackQuestionOption) => opt.id === optionId
                );
                return `${index + 1}. ${option ? option.text : optionId}`;
              }
            );
            formattedAnswer = rankedTexts.join('; ');
          }
          break;
        }

        processedAnswers.push({
          question: question.title,
          answer: formattedAnswer,
          type: question.type as string,
        });
      }

      return {
        guestName: feedback.guestName || 'Anonymous',
        answers: processedAnswers,
      };
    });

    const analysis = await this.analyzeStructuredFeedback(structuredFeedback);

    event.feedbackAnalysis = {
      ...analysis,
      lastUpdated: new Date(),
    };

    return await event.save();
  }

  async getEventTasks(eventId: string) {
    const event = await Event.findById(eventId);
    if (!event) return null;
    return event.tasks;
  }

  async addEventTask(eventId: string, taskData: Partial<ITask>) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    if (!taskData.status) taskData.status = 'next';
    if (!taskData.isCompleted) taskData.isCompleted = false;
    if (!taskData.priority) taskData.priority = 'medium';

    taskData.createdAt = new Date();
    taskData.updatedAt = new Date();

    event.tasks.push(taskData as ITask);
    return await event.save();
  }

  async updateEventTask(eventId: string, taskId: string, taskData: Partial<ITask>) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    const taskIndex = event.tasks.findIndex((task: ITask) => task._id && task._id.toString() === taskId);
    if (taskIndex === -1) return null;

    taskData.updatedAt = new Date();

    Object.keys(taskData).forEach((key) => {
      event.tasks[taskIndex][key as keyof ITask] = taskData[key as keyof ITask];
    });

    return await event.save();
  }

  async deleteEventTask(eventId: string, taskId: string) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    const taskIndex = event.tasks.findIndex((task: ITask) => task._id && task._id.toString() === taskId);
    if (taskIndex === -1) return null;

    event.tasks.splice(taskIndex, 1);
    return await event.save();
  }

  async updateTaskStatus(eventId: string, taskId: string, status: string) {
    if (!['next', 'inProgress', 'finished'].includes(status)) {
      throw new Error('Invalid status value');
    }

    const event = await Event.findById(eventId);
    if (!event) return null;

    const taskIndex = event.tasks.findIndex((task: ITask) => task._id && task._id.toString() === taskId);
    if (taskIndex === -1) return null;

    event.tasks[taskIndex].status = status as 'next' | 'inProgress' | 'finished';
    event.tasks[taskIndex].isCompleted = status === 'finished';
    event.tasks[taskIndex].updatedAt = new Date();

    return await event.save();
  }

  async uploadSponsorDealImage(image: string) {
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'sponsor_deals',
      resource_type: 'image',
    });

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  }

  async uploadSleepVideo(file: Express.Multer.File) {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only MP4, WebM, and Ogg video formats are supported.');
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File is too large. Maximum size is 100MB.');
    }

    const base64Video = file.buffer.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64Video}`;

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'video',
      folder: 'sleep_videos',
      transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
    });

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    };
  }

  async updateEventFeedbackAnalysis(
    eventId: string, 
    analysis: IReviewAnalysis
  ): Promise<mongoose.Document | null> {
    const event = await Event.findById(eventId);
    if (!event) {
      return null;
    }

    event.feedbackAnalysis = {
      ...analysis,
      lastUpdated: new Date(),
    };

    return event.save();
  }

  async rewriteDescription(description: string) {
    return await this.rewriteEventDescription(description);
  }
}
