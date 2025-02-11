import type { Request, Response } from 'express';
import Guest from '../models/guest.model';
import Event from '../models/event.model';
import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'mongoose';

export const createGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, fullName, email, age, attendance_status, phoneNumber } = req.body;

    console.log('Received data:', { eventId, fullName, email, age, attendance_status, phoneNumber });

    if (!isValidObjectId(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid eventId' });
      return;
    }

    if (!fullName || !email) {
      res.status(400).json({ success: false, message: 'fullName and email are required' });
      return;
    }

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
  }
};

export const updateGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid guest id' });
      return;
    }

    const updatedGuest = await Guest.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedGuest) {
      res.status(404).json({ success: false, message: 'Guest not found' });
      return;
    }
    res.json({ success: true, data: updatedGuest });
  } catch (error) {
    console.error('Error in Update Guest:', error);
  }
};

export const deleteGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid guest id' });
      return;
    }

    const deletedGuest = await Guest.findByIdAndDelete(id);
    if (!deletedGuest) {
      res.status(404).json({ success: false, message: 'Guest not found' });
      return;
    }

    // Remove guest from the associated event
    await Event.updateOne({ _id: deletedGuest.eventId }, { $pull: { guests: deletedGuest._id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error in Delete Guest:', error);
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid guest id' });
      return;
    }

    const guest = await Guest.findByIdAndUpdate(
      id,
      { attendance_status: true },
      { new: true, runValidators: true }
    );

    if (!guest) {
      res.status(404).json({ success: false, message: 'Guest not found' });
      return;
    }

    res.json({ success: true, data: guest });
  } catch (error) {
    console.error('Error in Mark Attendance:', error);
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

export const markEmailSent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: 'Invalid guest id' });
      return;
    }

    const guest = await Guest.findByIdAndUpdate(
      id,
      { email_sent: true },
      { new: true, runValidators: true }
    );

    if (!guest) {
      res.status(404).json({ success: false, message: 'Guest not found' });
      return;
    }

    res.json({ success: true, data: guest });
  } catch (error) {
    console.error('Error in Mark Email Sent:', error);
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};
