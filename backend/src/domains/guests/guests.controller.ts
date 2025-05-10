import type { Request, Response } from 'express';
import { GuestsService } from './guests.service';

const guestsService = new GuestsService();

export const createGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, fullName, email, age, attendance_status, phoneNumber, gdpr_consent } = req.body;

    try {
      const savedGuest = await guestsService.createGuest(
        {
          fullName,
          email,
          age,
          attendance_status,
          phoneNumber,
          gdpr_consent,
        },
        eventId,
      );

      res.status(201).json({ success: true, data: savedGuest });
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Create Guest:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Updating guest:', req.params.id, req.body);
    try {
      const updatedGuest = await guestsService.updateGuest(req.params.id, req.body);
      res.json({ success: true, data: updatedGuest });
    } catch (error) {
      if (error instanceof Error && error.message === 'Guest not found') {
        res.status(404).json({ success: false, message: 'Guest not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Update Guest:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      await guestsService.deleteGuest(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Guest not found') {
        res.status(404).json({ success: false, message: 'Guest not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Delete Guest:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    try {
      const guest = await guestsService.markAttendance(req.params.id, status);
      res.json({ success: true, data: guest });
    } catch (error) {
      if (error instanceof Error && error.message === 'Guest not found') {
        res.status(404).json({ success: false, message: 'Guest not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Mark Attendance:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const markEmailSent = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      const guest = await guestsService.markEmailSent(req.params.id);
      res.json({ success: true, data: guest });
    } catch (error) {
      if (error instanceof Error && error.message === 'Guest not found') {
        res.status(404).json({ success: false, message: 'Guest not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Mark Email Sent:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateReminderEmailDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reminderDate } = req.body;

    try {
      const guest = await guestsService.updateReminderEmailDate(req.params.id, new Date(reminderDate));
      res.json({ success: true, data: guest });
    } catch (error) {
      if (error instanceof Error && error.message === 'Guest not found') {
        res.status(404).json({ success: false, message: 'Guest not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Update Reminder Email Date:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getGuestById = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      const guest = await guestsService.getGuestById(req.params.id);
      res.json({
        success: true,
        data: guest,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Guest not found') {
        res.status(404).json({ success: false, message: 'Guest not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Get Guest:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAllGuests = async (req: Request, res: Response): Promise<void> => {
  try {
    const guests = await guestsService.getAllGuests();
    res.json(guests);
  } catch (error) {
    console.error('Error in Get All Guests:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
