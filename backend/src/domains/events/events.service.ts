/* eslint-disable @typescript-eslint/no-explicit-any */
import Event from '../../models/event.model';
import Guest from '../../models/guest.model';
import Invoice from '../../models/invoice.model';
import cloudinary from '../../config/cloudinary';
import { uploadImage } from '../../config/cloudinary';
import { extractPublicId } from '../../utils/helpers';
import { extractTextFromPdf } from './pdf.service';
import xlsx from 'xlsx';
import {
  analyzeInvoices,
  analyzeStructuredFeedback,
  rewriteEventDescription
} from './openai.service';
import { SUBSCRIPTION_GUEST_LIMITS } from '../../types/subscription.types';
import { UsersService } from '../users/users.service';
import mongoose from 'mongoose';

const usersService = new UsersService();

interface GuestData {
  fullName: string;
  email: string;
  phoneNumber: string;
  age: number;
}

export class EventsService {
  // Event CRUD operations
  async createEvent(eventData: any, userId: string) {
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

  async getEventById(id: string) {
    return await Event.findById(id).populate('guests');
  }

  async updateEvent(id: string, updateData: any) {
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

  // Event poster operations
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

    return await Event.findByIdAndUpdate(
      id,
      { poster: uploadResponse.secure_url },
      { new: true },
    );
  }

  // Guest operations
  async updateEventGuests(eventId: string, guests: any[], userId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      return null;
    }

    // Получаем уровень подписки пользователя
    const subscriptionLevel = await usersService.getUserSubscriptionLevel(userId);
    const guestLimit = SUBSCRIPTION_GUEST_LIMITS[subscriptionLevel];

    // Проверяем, не превышает ли количество гостей лимит
    if (guests.length > guestLimit) {
      throw new Error(
        `Превышен лимит количества гостей для вашего уровня подписки. 
        Текущий лимит: ${guestLimit} гостей. 
        Попробуйте обновить подписку для увеличения лимита.`
      );
    }

    event.guests = guests;
    return await event.save();
  }

  private async readGuestsFromExcel(fileBuffer: Buffer): Promise<GuestData[]> {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const dataWithoutHeader = data.slice(1);

    if (dataWithoutHeader.length === 0) {
      throw new Error('No guest data found in the Excel file');
    }

    const guests = dataWithoutHeader.map((row: any) => ({
      fullName: row[0]?.toString().trim(),
      email: row[1]?.toString().trim(),
      phoneNumber: row[2]?.toString().trim() || '',
      age: 0
    })).filter(guest => guest.fullName && guest.email);

    return guests;
  }

  async uploadGuestsFromExcel(eventId: string, fileBuffer: Buffer, userId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      return null;
    }

    // Читаем Excel файл и получаем список гостей
    const guestData = await this.readGuestsFromExcel(fileBuffer);

    // Получаем уровень подписки пользователя
    const subscriptionLevel = await usersService.getUserSubscriptionLevel(userId);
    const guestLimit = SUBSCRIPTION_GUEST_LIMITS[subscriptionLevel];

    // Проверяем, не превышает ли количество гостей лимит
    if (guestData.length > guestLimit) {
      throw new Error(
        `Превышен лимит количества гостей для вашего уровня подписки. 
        Текущий лимит: ${guestLimit} гостей. 
        Попробуйте обновить подписку для увеличения лимита.`
      );
    }

    // Создаем гостей в базе данных
    const createdGuests = await Guest.insertMany(guestData);
    const guestIds = createdGuests.map(guest => guest._id) as mongoose.Types.ObjectId[];

    // Обновляем список гостей в событии
    event.guests = guestIds;
    return await event.save();
  }

  async downloadGuestsToExcel(id: string) {
    const event = await Event.findById(id).populate('guests');
    if (!event) return null;

    const data = event.guests.map((guest: any) => ({
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

  // Feedback operations
  async addEventFeedback(id: string, feedbackData: any) {
    const event = await Event.findById(id);
    if (!event) return null;

    if (event.feedbackForm && event.feedbackForm.questions) {
      const questionIds = event.feedbackForm.questions.map((q) => q.id);
      const invalidQuestionIds = feedbackData.answers.filter((a: any) => !questionIds.includes(a.questionId));

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

    return event.feedbackForm || {
      title: 'Event Feedback',
      description: 'Please share your thoughts about the event',
      questions: [],
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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
      (q: { options?: any[]; title: string }) =>
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

  // Invoice operations
  async uploadInvoice(id: string, file: Express.Multer.File, invoiceData: any) {
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

    const invoice = new Invoice({
      eventId: id,
      title: file.originalname.replace(/\.pdf$/i, ''),
      pdfUrl: pdfUrl,
      amount: invoiceData.amount ? parseFloat(invoiceData.amount) : undefined,
      date: invoiceData.date ? new Date(invoiceData.date) : new Date(),
      vendor: invoiceData.vendor || undefined,
      category: invoiceData.category || undefined,
      isPaid: invoiceData.isPaid === 'true' || invoiceData.isPaid === true || false,
    });

    await invoice.save();
    await Event.findByIdAndUpdate(id, { $push: { invoices: invoice._id } });

    return invoice;
  }

  async getEventInvoices(id: string) {
    return await Invoice.find({ eventId: id }).sort({ createdAt: -1 });
  }

  async deleteInvoice(id: string) {
    const invoice = await Invoice.findById(id);
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
    return await Invoice.findByIdAndDelete(id);
  }

  // Analysis operations
  async analyzeEventInvoices(id: string) {
    const event = await Event.findById(id);
    if (!event) return null;

    const invoices = await Invoice.find({ eventId: id });
    if (invoices.length === 0) {
      throw new Error('No invoices found for this event');
    }

    const invoiceTexts: string[] = [];
    const invoiceData = [];

    for (const invoice of invoices) {
      try {
        const text = await extractTextFromPdf(invoice.pdfUrl);
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

    const analysis = await analyzeInvoices(invoiceTexts);

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

    if (!event.feedbackForm || !event.feedbackForm.questions || event.feedbackForm.questions.length === 0) {
      throw new Error('No feedback form structure available');
    }

    const structuredFeedback = event.feedback.map((feedback) => {
      const processedAnswers = [];

      for (const answer of feedback.answers) {
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
          type: question.type as string,
        });
      }

      return {
        guestName: feedback.guestName || 'Anonymous',
        answers: processedAnswers,
      };
    });

    const analysis = await analyzeStructuredFeedback(structuredFeedback);

    event.feedbackAnalysis = {
      ...analysis,
      lastUpdated: new Date(),
    };

    return await event.save();
  }

  // Task operations
  async getEventTasks(eventId: string) {
    const event = await Event.findById(eventId);
    if (!event) return null;
    return event.tasks;
  }

  async addEventTask(eventId: string, taskData: any) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    if (!taskData.status) taskData.status = 'next';
    if (!taskData.isCompleted) taskData.isCompleted = false;
    if (!taskData.priority) taskData.priority = 'medium';

    taskData.createdAt = new Date();
    taskData.updatedAt = new Date();

    event.tasks.push(taskData);
    return await event.save();
  }

  async updateEventTask(eventId: string, taskId: string, taskData: any) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    const taskIndex = event.tasks.findIndex((task) => task._id && task._id.toString() === taskId);
    if (taskIndex === -1) return null;

    taskData.updatedAt = new Date();

    Object.keys(taskData).forEach((key) => {
      // @ts-expect-error - We're dynamically updating fields
      event.tasks[taskIndex][key] = taskData[key];
    });

    return await event.save();
  }

  async deleteEventTask(eventId: string, taskId: string) {
    const event = await Event.findById(eventId);
    if (!event) return null;

    const taskIndex = event.tasks.findIndex((task) => task._id && task._id.toString() === taskId);
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

    const taskIndex = event.tasks.findIndex((task) => task._id && task._id.toString() === taskId);
    if (taskIndex === -1) return null;

    // @ts-expect-error - We're updating the task directly
    event.tasks[taskIndex].status = status;
    // @ts-expect-error - We're updating the task directly
    event.tasks[taskIndex].isCompleted = status === 'finished';
    // @ts-expect-error - We're updating the task directly
    event.tasks[taskIndex].updatedAt = new Date();

    return await event.save();
  }

  // Other operations
  async rewriteDescription(description: string) {
    return await rewriteEventDescription(description);
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

    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
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

  async updateEventFeedbackAnalysis(eventId: string, analysis: any): Promise<any> {
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
}
