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
    const { guestName, content } = req.body;

    if (!content) {
      res.status(400).json({
        success: false,
        message: 'Feedback content is required',
      });
      return;
    }

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const feedback = {
      guestName: guestName || undefined,
      content,
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
