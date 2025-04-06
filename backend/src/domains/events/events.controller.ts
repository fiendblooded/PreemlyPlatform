/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import axios from 'axios';
import multer from 'multer';
import { EventsService } from './events.service';
import { AuthRequest } from '../../types/auth.types';
import { processEventDescription } from '../../domains/openai-wrapper/openai-wrapper.controller'; // TODO: move to events.controller

import { analyzeReviews } from './openai.service';

const eventsService = new EventsService();
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
    console.log(`Создание события пользователем с уровнем подписки: ${req.user.subscriptionLevel}`);
    
    const newEvent = await eventsService.createEvent(event, req.user.sub);
    res.json({
      success: true,
      message: { _id: newEvent._id },
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

    const eventsWithImages = await Promise.all(
      events.map(async (event) => {
        try {
          const imageResponse = await axios.get(event.poster, {
            responseType: 'arraybuffer',
          });
          const imageBase64 = Buffer.from(imageResponse.data, 'binary').toString('base64');

          return {
            ...event.toObject(),
            posterImage: `data:image/jpeg;base64,${imageBase64}`,
          };
        } catch (err) {
          console.error(`Error fetching image for event ${event._id}:`, err);
          return {
            ...event.toObject(),
            posterImage: null,
          };
        }
      }),
    );

    res.json({ success: true, data: eventsWithImages });
  } catch (error) {
    console.error('Error fetching events:', error);
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

export const updateEventGuests = async (req: Request, res: Response): Promise<void> => {
  const { guests } = req.body;

  if (!Array.isArray(guests)) {
    res.status(400).json({
      success: false,
      message: 'Guests must be provided as an array',
    });
    return;
  }

  try {
    const updatedEvent = await eventsService.updateEventGuests(req.params.id, guests);
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
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const uploadGuestsFromExcel = async (req: Request, res: Response): Promise<void> => {
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
      const updatedEvent = await eventsService.uploadGuestsFromExcel(req.params.id, req.file.buffer);
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
        message: 'Feedback answers are required',
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
      message: 'Feedback added successfully',
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
      message: 'Feedback form updated successfully',
      data: updatedEvent.feedbackForm,
    });
  } catch (error) {
    console.error('Error updating feedback form:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const analyzeEventFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEvent = await eventsService.analyzeEventFeedback(req.params.id);
    if (!updatedEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: updatedEvent.feedbackAnalysis,
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
    const updatedEvent = await eventsService.updateEventTask(
      req.params.eventId,
      req.params.taskId,
      req.body,
    );
    if (!updatedEvent) {
      res.status(404).json({ message: 'Event or task not found' });
      return;
    }
    const task = updatedEvent.tasks.find(
      (t) => t._id && t._id.toString() === req.params.taskId,
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

    const updatedEvent = await eventsService.updateTaskStatus(
      req.params.eventId,
      req.params.taskId,
      status,
    );
    if (!updatedEvent) {
      res.status(404).json({ message: 'Event or task not found' });
      return;
    }
    const task = updatedEvent.tasks.find(
      (t) => t._id && t._id.toString() === req.params.taskId,
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
    const analysis = await analyzeReviews(reviews);
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
