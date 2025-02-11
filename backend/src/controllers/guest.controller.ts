import type { Request, Response } from 'express';
import Guest from '../models/guest.model';
import Event from '../models/event.model';
import { ObjectId } from 'mongodb';

export const createGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, fullName, email, age, attendance_status, phoneNumber } = req.body;

    // Log the received data
    console.log('Received data:', { eventId, fullName, email, age, attendance_status, phoneNumber });

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const newGuest = new Guest({
      fullName,
      email,
      age,
      phoneNumber,
      eventId,
      attendance_status,
    });

    console.log('New guest object:', newGuest);

    const savedGuest = await newGuest.save();

    console.log('Saved guest:', savedGuest);

    event.guests.push(savedGuest._id as ObjectId);
    await event.save();

    res.status(201).json({ success: true, data: savedGuest });
  } catch (error) {
    console.error('Error in Create Guest:', error);
    // Log the full error object
    console.error('Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const updateGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedGuest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGuest) {
      res.status(404).json({ success: false, message: 'Guest not found' });
      return;
    }
    res.json({ success: true, data: updatedGuest });
  } catch (error) {
    console.error('Error in Update Guest:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedGuest = await Guest.findByIdAndDelete(req.params.id);
    if (!deletedGuest) {
      res.status(404).json({ success: false, message: 'Guest not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error in Delete Guest:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      res.status(404).json({ success: false, message: 'Guest not found' });
      return;
    }

    guest.attendance_status = true;
    await guest.save();

    res.json({ success: true, data: guest });
  } catch (error) {
    console.error('Error in Mark Attendance:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const markEmailSent = async (req: Request, res: Response): Promise<void> => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      res.status(404).json({ success: false, message: 'Guest not found' });
      return;
    }

    guest.email_sent = true;
    await guest.save();

    res.json({ success: true, data: guest });
  } catch (error) {
    console.error('Error in Mark Email Sent:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

