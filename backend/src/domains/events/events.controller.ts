import { Request, Response } from 'express';
import axios from 'axios';
import multer from 'multer';
import { EventsService } from './events.service';
import { AuthRequest } from '../../types/auth.types';
import { processEventDescription } from '../../domains/openai-wrapper/openai-wrapper.controller';
import { SubscriptionLevel } from '../../types/subscription.types';
import { UsersService } from '../users/users.service';
import cloudinary from '../../config/cloudinary';

const eventsService = new EventsService();
const usersService = new UsersService();
const upload = multer({ storage: multer.memoryStorage() });

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const event = req.body;

  if (!event || !event?.title) {
    res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
    return;
  }

  if (!req?.user?.sub) {
    res.status(401).json({
      success: false,
      message: 'User ID is required',
    });
    return;
  }

  try {
    console.log(`Creating event by user with subscription level: ${req.user.subscriptionLevel}`);

    const newEvent = await eventsService.createEvent(event, req.user.sub);
    res.json({
      success: true,
      message: 'Event created successfully',
      data: {
        event: newEvent,
      },
    });
  } catch (error) {
    console.error('Error in Create Event:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req?.user?.sub) {
    res.status(401).json({
      success: false,
      message: 'User ID is required',
    });
    return;
  }

  try {
    const events = await eventsService.getEvents(req.user.sub);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getEventsSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const events = await eventsService.getEventsSummary(req.user.sub);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events summary:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await eventsService.getEventById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    try {
      const imageResponse = await axios.get(event.poster, {
        responseType: 'arraybuffer',
      });
      const imageBase64 = Buffer.from(imageResponse.data, 'binary').toString('base64');

      res.json({
        success: true,
        data: {
          ...event.toObject(),
          posterImage: `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    } catch (err) {
      console.error(`Error fetching image for event ${event._id}:`, err);
      res.json({
        success: true,
        data: {
          ...event.toObject(),
          posterImage: null,
        },
      });
    }
  } catch (error) {
    console.error('Error in Get Event:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEvent = await eventsService.updateEvent(req.params.id, req.body);
    if (!updatedEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Error in Update Event:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedEvent = await eventsService.deleteEvent(req.params.id);
    if (!deletedEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error in Delete Event:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateEventPoster = async (req: Request, res: Response): Promise<void> => {
  const { poster } = req.body;

  if (!poster) {
    res.status(400).json({
      success: false,
      message: 'Poster is required',
    });
    return;
  }

  try {
    const updatedEvent = await eventsService.updateEventPoster(req.params.id, poster);
    if (!updatedEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Error in Update Poster:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateEventGuests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { guests } = req.body;
  const userId = req.user?.sub;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Authorization required',
    });
    return;
  }

  if (!Array.isArray(guests)) {
    res.status(400).json({
      success: false,
      message: 'Guests must be provided as an array',
    });
    return;
  }

  try {
    const updatedEvent = await eventsService.updateEventGuests(req.params.id, guests, userId);
    if (!updatedEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating event guests:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server Error',
    });
  }
};

export const uploadGuestsFromExcel = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.sub;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Authorization required',
    });
    return;
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      res.status(400).json({ success: false, message: 'File upload error' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    try {
      const updatedEvent = await eventsService.uploadGuestsFromExcel(req.params.id, req.file.buffer, userId);
      if (!updatedEvent) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }
      res.json({
        success: true,
        data: updatedEvent,
      });
    } catch (error) {
      console.error('Error uploading guests from Excel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Server Error';
      res.status(500).json({
        success: false,
        message: `Error importing guests: ${errorMessage}`,
      });
    }
  });
};

export const downloadGuestsToExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const buffer = await eventsService.downloadGuestsToExcel(req.params.id);
    if (!buffer) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.setHeader('Content-Disposition', 'attachment; filename=guests.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading guests to Excel:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addEventFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { guestName, guestEmail, answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({
        success: false,
        message: 'IFeedback answers are required',
      });
      return;
    }

    const updatedEvent = await eventsService.addEventFeedback(req.params.id, {
      guestName,
      guestEmail,
      answers,
    });

    if (!updatedEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.json({
      success: true,
      message: 'IFeedback added successfully',
      data: updatedEvent.feedback?.[updatedEvent.feedback?.length - 1],
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getFeedbackForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedbackForm = await eventsService.getFeedbackForm(req.params.id);
    if (!feedbackForm) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.json({
      success: true,
      data: feedbackForm,
    });
  } catch (error) {
    console.error('Error getting feedback form:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateFeedbackForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEvent = await eventsService.updateFeedbackForm(req.params.id, req.body);
    if (!updatedEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.json({
      success: true,
      message: 'IFeedback form updated successfully',
      data: updatedEvent.feedbackForm,
    });
  } catch (error) {
    console.error('Error updating feedback form:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const analyzeEventFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authorization required',
      });
      return;
    }

    const subscriptionLevel = await usersService.getUserSubscriptionLevel(userId);
    const allowedLevels = [SubscriptionLevel.PLUS, SubscriptionLevel.PREMIUM, SubscriptionLevel.ENTERPRISE];
    
    if (!allowedLevels.includes(subscriptionLevel)) {
      res.status(403).json({
        success: false,
        message: 'IFeedback analysis is only available for PLUS, PREMIUM and ENTERPRISE subscriptions',
      });
      return;
    }

    try {
      const updatedEvent = await eventsService.analyzeEventFeedback(eventId);
      if (!updatedEvent) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: updatedEvent.feedbackAnalysis,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'No feedback available for analysis') {
          res.status(400).json({
            success: false,
            message: 'No feedback available for analysis',
          });
          return;
        } else if (error.message === 'No feedback form structure available') {
          res.status(400).json({
            success: false,
            message: 'No feedback form structure available',
          });
          return;
        }
      }
      throw error;
    }
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

export const rewriteDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description } = req.body;

    if (!description) {
      res.status(400).json({
        success: false,
        message: 'Description is required',
        data: null,
      });
      return;
    }

    const rewrittenDescription = await eventsService.rewriteDescription(description);

    res.json({
      success: true,
      message: 'Description rewritten successfully',
      data: { description: rewrittenDescription },
    });
  } catch (error) {
    console.error('Error in Rewrite Description:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      data: null,
    });
  }
};

export const uploadSponsorDealImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({ success: false, message: 'No image provided' });
      return;
    }

    const result = await eventsService.uploadSponsorDealImage(image);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error uploading sponsor deal image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

export const uploadSleepVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No video file provided' });
      return;
    }

    const result = await eventsService.uploadSleepVideo(req.file);

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error uploading sleep video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
    });
  }
};

export const getEventTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await eventsService.getEventTasks(req.params.eventId);
    if (!tasks) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
};

export const addEventTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEvent = await eventsService.addEventTask(req.params.eventId, req.body);
    if (!updatedEvent) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.status(201).json({
      message: 'Task added successfully',
      task: updatedEvent.tasks[updatedEvent.tasks.length - 1],
    });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Failed to add task', error });
  }
};

export const updateEventTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEvent = await eventsService.updateEventTask(req.params.eventId, req.params.taskId, req.body);
    if (!updatedEvent) {
      res.status(404).json({ message: 'Event or task not found' });
      return;
    }
    
    type TaskItem = { _id?: { toString(): string } };
    
    const task = updatedEvent.tasks.find(
      (t: TaskItem) => t._id && t._id.toString() === req.params.taskId
    );
    
    res.status(200).json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error });
  }
};

export const deleteEventTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEvent = await eventsService.deleteEventTask(req.params.eventId, req.params.taskId);
    if (!updatedEvent) {
      res.status(404).json({ message: 'Event or task not found' });
      return;
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    if (!['next', 'inProgress', 'finished'].includes(status)) {
      res.status(400).json({ message: 'Invalid status value' });
      return;
    }

    const updatedEvent = await eventsService.updateTaskStatus(req.params.eventId, req.params.taskId, status);
    if (!updatedEvent) {
      res.status(404).json({ message: 'Event or task not found' });
      return;
    }
    
    type TaskItem = { _id?: { toString(): string } };
    
    const task = updatedEvent.tasks.find(
      (t: TaskItem) => t._id && t._id.toString() === req.params.taskId
    );
    
    res.status(200).json({
      message: 'Task status updated successfully',
      task,
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Failed to update task status', error });
  }
};

export const processEventDescriptionWithAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, existingEventData } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const eventData = await processEventDescription(message, existingEventData);
    res.status(200).json({ eventData });
  } catch (error) {
    console.error('Error processing event description with OpenAI:', error);
    res.status(500).json({ error: 'Failed to process event description' });
  }
};

export const analyzeEventReviews = async (req: Request, res: Response): Promise<void> => {
  const { eventId, reviews } = req.body;

  if (!eventId) {
    res.status(400).json({
      success: false,
      message: 'Event ID is required',
    });
    return;
  }

  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    res.status(400).json({
      success: false,
      message: 'No reviews provided',
    });
    return;
  }

  try {
    const analysis = await eventsService.analyzeReviews(reviews);
    const updatedEvent = await eventsService.updateEventFeedbackAnalysis(eventId, analysis);

    if (!updatedEvent) {
      res.status(404).json({
        success: false,
        message: 'Event not found',
      });
      return;
    }

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

export const uploadInvoice = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  try {
    const event = await eventsService.getEventById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const base64Data = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;

    const filename = req.file.originalname.replace(/\.pdf$/i, '');

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

    const { amount, date, vendor, category, isPaid } = req.body;

    const invoice = await eventsService.uploadInvoice(id, req.file, {
      title: req.file.originalname.replace(/\.pdf$/i, ''),
      pdfUrl,
      amount: amount ? parseFloat(amount) : undefined,
      date: date ? new Date(date) : new Date(),
      vendor: vendor || undefined,
      category: category || undefined,
      isPaid: isPaid === 'true' || isPaid === true || false,
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error: unknown) {
    console.error('Error uploading invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const getEventInvoices = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const invoices = await eventsService.getEventInvoices(id);
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    console.log(`Attempting to delete invoice with ID: ${id}`);

    try {
      const invoice = await eventsService.deleteInvoice(id);
      
      if (invoice && invoice.pdfUrl) {
        try {
          const match = invoice.pdfUrl.match(/event_invoices\/([^/]+)(?:\.[^.]+)?$/);
          const publicId = match ? match[1] : null;

          if (publicId) {
            console.log(`Attempting to delete from Cloudinary: event_invoices/${publicId}`);
            await cloudinary.uploader.destroy(`event_invoices/${publicId}`, {
              resource_type: 'raw',
            });
          }
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
        }
      }

      res.status(200).json({ success: true, message: 'IInvoice deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'IInvoice not found') {
        res.status(404).json({ success: false, message: 'IInvoice not found' });
        return;
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error('Error deleting invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ success: false, message: 'Server Error', error: errorMessage });
  }
};

export const analyzeEventInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.sub;

  try {
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authorization required',
      });
      return;
    }

    const subscriptionLevel = await usersService.getUserSubscriptionLevel(userId);
    const allowedLevels = [SubscriptionLevel.PLUS, SubscriptionLevel.PREMIUM, SubscriptionLevel.ENTERPRISE];
    
    if (!allowedLevels.includes(subscriptionLevel)) {
      res.status(403).json({
        success: false,
        message: 'IInvoice analysis is only available for PLUS, PREMIUM and ENTERPRISE subscriptions',
      });
      return;
    }

    try {
      const updatedEvent = await eventsService.analyzeEventInvoices(id);
      if (!updatedEvent) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: updatedEvent.invoiceAnalysis,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('No invoices found')) {
          res.status(400).json({ success: false, message: error.message });
          return;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error analyzing invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: errorMessage,
    });
  }
};
