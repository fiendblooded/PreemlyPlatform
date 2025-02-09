import { Request, Response } from 'express';
import Event from '../models/event.model';
import { uploadImage } from '../config/cloudinary';
import axios from 'axios';
import { AuthRequest } from '../types/auth.types';
import cloudinary from '../config/cloudinary';
import { extractPublicId } from '../utils/helpers';

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const event = req.body;

  if (!event || !event?.title || !event?.poster) {
    res.status(400).json({
      success: false,
      message: 'Please provide all fields, including poster',
    });
    return;
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(event.poster, {
      folder: 'events_posters',
    });

    const newEvent = new Event({
      title: event.title,
      description: event.description,
      ownerId: req.user?.sub,
      date: event.date,
      endDate: event.date,
      eventType: 'Offline',
      poster: uploadResponse.secure_url,
      location: {
        address: '1600 Amphitheatre Parkway, Mountain View, CA, USA',
        latitude: 37.4224764,
        longitude: -122.0842499,
        placeId: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
      },
      tasks: [],
      welcomeScreenParams: {
        backgroundColor: '',
        textColor: '',
        isGdpr: false,
        isManualCheckin: true,
        videoUrl: '',
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
          const imageBase64 = Buffer.from(
            imageResponse.data,
            'binary'
          ).toString('base64');

          return {
            ...event.toObject(),
            posterImage: `data:image/jpeg;base64,${imageBase64}`,
          };
        } catch (err) {
          console.error(
            `Error fetching image for event ${event._id}:`,
            err
          );
          return {
            ...event.toObject(),
            posterImage: null,
          };
        }
      })
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
      const imageBase64 = Buffer.from(imageResponse.data, 'binary').toString(
        'base64'
      );

      res.json({
        success: true,
        data: {
          ...event.toObject(),
          posterImage: `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    } catch (err) {
      console.error(
        `Error fetching image for event ${event._id}:`,
        err
      );
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
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
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
        const deleteResponse = await cloudinary.uploader.destroy(
          'events_posters/' + posterPublicId
        );
        console.log('Image delete response:', deleteResponse);
      } catch (cloudinaryError) {
        console.error(
          'Error deleting old image from Cloudinary:',
          cloudinaryError
        );
      }
    }

    const uploadResponse = await uploadImage(poster, 'events_posters');

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { poster: uploadResponse.secure_url },
      { new: true }
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
        const deleteResponse = await cloudinary.uploader.destroy(
          'events_posters/' + posterPublicId
        );
        console.log('Image delete response:', deleteResponse);
      } catch (cloudinaryError) {
        console.error(
          'Error deleting image from Cloudinary:',
          cloudinaryError
        );
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
    // Create guest documents
    const createdGuests = await Event.insertMany(guests);

    // Extract ObjectIds of created guests
    const guestIds = createdGuests.map((guest) => guest._id);

    // Update the event with the new guest ObjectIds
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $addToSet: { guests: { $each: guestIds } } },
      { new: true }
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
