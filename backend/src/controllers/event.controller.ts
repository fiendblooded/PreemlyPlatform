/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import Event from '../models/event.model';
import Guest from '../models/guest.model';
import { AuthRequest } from '../types/auth.types';
import { uploadImage } from '../config/cloudinary';
import axios from 'axios';
import cloudinary from '../config/cloudinary';
import { extractPublicId } from '../utils/helpers';
import xlsx from 'xlsx';
import multer from 'multer';
import Task from '../models/task.model';
import { rewriteEventDescription } from '../services/openai.service';

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

  try {
    let posterUrl = '';

    // Only upload to Cloudinary if a poster is provided
    if (event.poster && event.poster.trim() !== '') {
      const uploadResponse = await cloudinary.uploader.upload(event.poster, {
        folder: 'events_posters',
      });
      posterUrl = uploadResponse.secure_url;
    }

    // Use values from request when available, otherwise use defaults
    const newEvent = new Event({
      title: event.title,
      description: event.description || '',
      ownerId: req?.user?.sub,
      date: event.date || '2025-03-20T23:00:23.000+00:00',
      endDate: event.endDate || event.date || '2025-03-20T23:00:23.000+00:00',
      eventType: event.eventType || 'Offline',
      poster: posterUrl,
      location: event.location || {
        address: '1600 Amphitheatre Parkway, Mountain View, CA, USA',
        latitude: 37.4224764,
        longitude: -122.0842499,
        placeId: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
      },
      tasks: event.tasks || [],
      welcomeScreenParams: event.welcomeScreenParams || {
        backgroundColor: '',
        textColor: '',
        isGdpr: false,
        isManualCheckin: true,
        videoUrl: '',
      },
      emailParams: event.emailParams || {
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
    await newEvent.save();

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
  try {
    const events = await Event.find({ ownerId: req.user?.sub });

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
    const event = await Event.findById(req.params.id).populate('guests');
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
    console.log('Request body:', JSON.stringify(req.body));

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (existingEvent.poster) {
      try {
        const posterPublicId = extractPublicId(existingEvent.poster);
        const deleteResponse = await cloudinary.uploader.destroy('events_posters/' + posterPublicId);
        console.log('Image delete response:', deleteResponse);
      } catch (cloudinaryError) {
        console.error('Error deleting old image from Cloudinary:', cloudinaryError);
      }
    }

    const uploadResponse = await uploadImage(poster, 'events_posters');

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { poster: uploadResponse.secure_url },
      { new: true },
    );

    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Error in Update Poster:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventToDelete = await Event.findById(req.params.id);
    if (!eventToDelete) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    if (eventToDelete.poster) {
      try {
        const posterPublicId = extractPublicId(eventToDelete.poster);
        const deleteResponse = await cloudinary.uploader.destroy('events_posters/' + posterPublicId);
        console.log('Image delete response:', deleteResponse);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
      }
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(204).send();
  } catch (error) {
    console.error('Error in Delete Event:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateEventGuests = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { guests } = req.body;

  if (!Array.isArray(guests)) {
    res.status(400).json({
      success: false,
      message: 'Guests must be provided as an array',
    });
    return;
  }

  try {
    const createdGuests = await Guest.insertMany(guests);
    const guestIds = createdGuests.map((guest) => guest._id);

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $addToSet: { guests: { $each: guestIds } } },
      { new: true },
    ).populate('guests');

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

    const { id } = req.params;
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    try {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // Skip the header row (first row)
      const dataWithoutHeader = data.slice(1);

      // Validate that we have data
      if (dataWithoutHeader.length === 0) {
        res.status(400).json({
          success: false,
          message:
            'No guest data found in the Excel file. Please make sure your file contains guest information.',
        });
        return;
      }

      // Define interfaces for our guest data
      interface GuestData {
        fullName: string;
        email: string;
        phoneNumber: string;
        age: number;
      }

      interface InvalidRow {
        rowNumber: number;
        fullName: string;
        email: string;
      }

      // Filter out rows with empty required fields and create valid guest objects
      const validGuests: GuestData[] = [];
      const invalidRows: InvalidRow[] = [];

      dataWithoutHeader.forEach((row: any, index: number) => {
        // Skip completely empty rows
        if (!row || row.length === 0 || (row.length === 1 && !row[0])) {
          return;
        }

        const fullName = row[0]?.toString().trim();
        const email = row[1]?.toString().trim();

        if (fullName && email) {
          validGuests.push({
            fullName,
            email,
            phoneNumber: row[2]?.toString().trim() || '',
            age: 0,
          });
        } else {
          invalidRows.push({
            rowNumber: index + 2, // +2 because we're 0-indexed and skipped header
            fullName: fullName || '[MISSING]',
            email: email || '[MISSING]',
          });
        }
      });

      // If we have invalid rows, return an error with details
      if (invalidRows.length > 0 && validGuests.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'All rows in the Excel file are missing required fields (Full Name and Email).',
          invalidRows,
        });
      }

      if (invalidRows.length > 0) {
        // We have some valid and some invalid rows
        const errorMessage =
          `${invalidRows.length} row(s) in the Excel file are missing required fields ` +
          '(Full Name and Email). Please fix these rows and try again.';

        return res.status(400).json({
          success: false,
          message: errorMessage,
          invalidRows,
        });
      }

      // If we have no valid guests after filtering, return an error
      if (validGuests.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid guest data found. Each guest must have both a name and email.',
        });
        return;
      }

      const createdGuests = await Guest.insertMany(validGuests);
      const guestIds = createdGuests.map((guest) => guest._id);

      const updatedEvent = await Event.findByIdAndUpdate(
        id,
        { $addToSet: { guests: { $each: guestIds } } },
        { new: true },
      ).populate('guests');

      if (!updatedEvent) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      res.json({
        success: true,
        message: `Successfully imported ${validGuests.length} guests.`,
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
  const { id } = req.params;

  try {
    const event = await Event.findById(id).populate('guests');
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const guests = event.guests;

    const data = guests.map((guest: any) => ({
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

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

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
    const { id } = req.params;
    const { guestName, guestEmail, answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Feedback answers are required',
      });
      return;
    }

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Validate that all questionIds exist in the feedback form
    if (event.feedbackForm && event.feedbackForm.questions) {
      const questionIds = event.feedbackForm.questions.map((q) => q.id);
      const invalidQuestionIds = answers.filter((a) => !questionIds.includes(a.questionId));

      if (invalidQuestionIds.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Some question IDs are invalid',
          invalidQuestionIds: invalidQuestionIds.map((a) => a.questionId),
        });
        return;
      }
    }

    const feedback = {
      guestName: guestName || undefined,
      guestEmail: guestEmail || undefined,
      answers,
      createdAt: new Date(),
    };

    if (!event.feedback) {
      event.feedback = [];
    }

    event.feedback.push(feedback);
    await event.save();

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: feedback,
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateFeedbackForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const feedbackForm = req.body;

    if (!feedbackForm || !feedbackForm.questions || !Array.isArray(feedbackForm.questions)) {
      res.status(400).json({
        success: false,
        message: 'Invalid feedback form structure',
      });
      return;
    }

    // Ensure all questions have unique IDs
    const questionIds = feedbackForm.questions.map((q: { id: string }) => q.id);
    if (new Set(questionIds).size !== questionIds.length) {
      res.status(400).json({
        success: false,
        message: 'All questions must have unique IDs',
      });
      return;
    }

    // Validate question types
    const validTypes = ['text', 'rating', 'single_choice', 'multiple_choice', 'ranking'];
    const invalidQuestions = feedbackForm.questions.filter(
      (q: { type: string; title: string }) => !validTypes.includes(q.type),
    );
    if (invalidQuestions.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid question type(s)',
        invalidQuestions: invalidQuestions.map((q: { title: string }) => q.title),
      });
      return;
    }

    // Ensure choice and ranking questions have options
    const choiceQuestions = feedbackForm.questions.filter((q: { type: string }) =>
      ['single_choice', 'multiple_choice', 'ranking'].includes(q.type),
    );

    const questionsWithoutOptions = choiceQuestions.filter(
      (q: { options?: any[]; title: string }) =>
        !q.options || !Array.isArray(q.options) || q.options.length < 2,
    );

    if (questionsWithoutOptions.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Choice and ranking questions must have at least 2 options',
        invalidQuestions: questionsWithoutOptions.map((q: { title: string }) => q.title),
      });
      return;
    }

    // Update the feedback form
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        feedbackForm: {
          ...feedbackForm,
          updatedAt: new Date(),
        },
      },
      { new: true },
    );

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

export const getFeedbackForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.json({
      success: true,
      data: event.feedbackForm || {
        title: 'Event Feedback',
        description: 'Please share your thoughts about the event',
        questions: [],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error getting feedback form:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const uploadSponsorDealImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({ success: false, message: 'No image provided' });
      return;
    }

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'sponsor_deals',
      resource_type: 'image',
    });

    res.status(200).json({
      success: true,
      data: {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
      },
    });
  } catch (error) {
    console.error('Error uploading sponsor deal image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

// Add a new task to an event
export const addEventTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const taskData = req.body;

    // Set default values if not provided
    if (!taskData.status) taskData.status = 'next';
    if (!taskData.isCompleted) taskData.isCompleted = false;
    if (!taskData.priority) taskData.priority = 'medium';

    // Add timestamps
    taskData.createdAt = new Date();
    taskData.updatedAt = new Date();

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    event.tasks.push(taskData);
    await event.save();

    res.status(201).json({
      message: 'Task added successfully',
      task: event.tasks[event.tasks.length - 1],
    });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Failed to add task', error });
  }
};

// Update an existing task
export const updateEventTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, taskId } = req.params;
    const taskData = req.body;

    // Update the timestamp
    taskData.updatedAt = new Date();

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const taskIndex = event.tasks.findIndex((task) => task._id && task._id.toString() === taskId);
    if (taskIndex === -1) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Update task fields
    Object.keys(taskData).forEach((key) => {
      // @ts-expect-error - We're dynamically updating fields
      event.tasks[taskIndex][key] = taskData[key];
    });

    await event.save();

    res.status(200).json({
      message: 'Task updated successfully',
      task: event.tasks[taskIndex],
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task', error });
  }
};

// Delete a task
export const deleteEventTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, taskId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const taskIndex = event.tasks.findIndex((task) => task._id && task._id.toString() === taskId);
    if (taskIndex === -1) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Remove the task
    event.tasks.splice(taskIndex, 1);
    await event.save();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error });
  }
};

// Update task status (for drag and drop functionality)
export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, taskId } = req.params;
    const { status } = req.body;

    if (!['next', 'inProgress', 'finished'].includes(status)) {
      res.status(400).json({ message: 'Invalid status value' });
      return;
    }

    // Find the event and populate the tasks
    const event = await Event.findById(eventId).populate('tasks');
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    const taskIndex = event.tasks.findIndex((task) => task._id && task._id.toString() === taskId);
    if (taskIndex === -1) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Update the task directly in the database
    await Task.findByIdAndUpdate(taskId, {
      status,
      isCompleted: status === 'finished',
      updatedAt: new Date(),
    });

    // Fetch the updated task
    const updatedTask = await Task.findById(taskId);

    res.status(200).json({
      message: 'Task status updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Failed to update task status', error });
  }
};

// Get all tasks for an event
export const getEventTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.status(200).json({ tasks: event.tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error });
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

    const rewrittenDescription = await rewriteEventDescription(description);

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

export const uploadSleepVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No video file provided' });
      return;
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        message: 'Invalid file type. Only MP4, WebM, and Ogg video formats are supported.',
      });
      return;
    }

    // Check file size (limit to 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (req.file.size > maxSize) {
      res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 100MB.',
      });
      return;
    }

    // Convert the file buffer to base64 for Cloudinary upload
    const base64Video = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Video}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'video',
      folder: 'sleep_videos',
      // Add transformation options if needed
      transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
    });

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
      },
    });
  } catch (error) {
    console.error('Error uploading sleep video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video',
    });
  }
};
