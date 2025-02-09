import type { Request, Response } from 'express';
import Guest from '../models/guest.model';
import Event from '../models/event.model';

export const createGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, fullName, email, age, attendance_status, phoneNumber } = req.body;

    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Create and save the new guest
    const newGuest = new Guest({
      fullName,
      email,
      age,
      phoneNumber,
      eventId,
      attendance_status,
    });
    const savedGuest = await newGuest.save();

    // Add the new guest to the event's guest list
    event.guests.push(savedGuest._id);
    await event.save();

    // Respond with the saved guest data
    res.status(201).json({ success: true, data: savedGuest });
  } catch (error) {
    console.error('Error in Create Guest:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
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

