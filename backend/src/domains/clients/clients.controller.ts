import type { Request, Response } from 'express';
import { ClientsService } from './clients.service';

const clientsService = new ClientsService();

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, firstName, lastName, email, phone, comment, attendance_status, gdpr_consent } = req.body;

    try {
      const savedClient = await clientsService.createClient(
        {
          firstName,
          lastName,
          email,
          phone,
          comment,
          attendance_status,
          gdpr_consent,
        },
        eventId,
      );

      res.status(201).json({ success: true, data: savedClient });
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Create Client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      const updatedClient = await clientsService.updateClient(req.params.id, req.body);
      res.json({ success: true, data: updatedClient });
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Update Client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      await clientsService.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Delete Client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    try {
      const client = await clientsService.markAttendance(req.params.id, status);
      res.json({ success: true, data: client });
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
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
      const client = await clientsService.markEmailSent(req.params.id);
      res.json({ success: true, data: client });
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
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
      const client = await clientsService.updateReminderEmailDate(req.params.id, new Date(reminderDate));
      res.json({ success: true, data: client });
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Update Reminder Email Date:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      const client = await clientsService.getClientById(req.params.id);
      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Get Client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await clientsService.getAllClients();
    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Error in Get All Clients:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getClientsByEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const clients = await clientsService.getClientsByEvent(eventId);
    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Error in Get Clients By Event:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getClientWithBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      const client = await clientsService.getClientWithBookings(req.params.id);
      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Get Client With Bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addBookingToClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      res.status(400).json({ success: false, message: 'Booking ID is required' });
      return;
    }

    try {
      const client = await clientsService.addBookingToClient(req.params.id, bookingId);
      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Add Booking To Client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const removeBookingFromClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      res.status(400).json({ success: false, message: 'Booking ID is required' });
      return;
    }

    try {
      const client = await clientsService.removeBookingFromClient(req.params.id, bookingId);
      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Remove Booking From Client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
