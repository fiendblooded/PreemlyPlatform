import type { Request, Response } from 'express';
import { BookingsService } from './bookings.service';
import { Types } from 'mongoose';

const bookingsService = new BookingsService();

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceProvider, serviceDate, serviceTime, client, products, totalAmount } = req.body;

    // Validate required fields
    if (!serviceProvider || !serviceDate || !serviceTime || !client) {
      res.status(400).json({
        success: false,
        message: 'Service provider, date, time, and client ID are required',
      });
      return;
    }

    try {
      const productsArray = products ? products.map((product: string) => new Types.ObjectId(product)) : [];

      const savedBooking = await bookingsService.createBooking({
        serviceProvider: new Types.ObjectId(serviceProvider),
        serviceDate: new Date(serviceDate),
        serviceTime,
        client: new Types.ObjectId(client),
        products: productsArray,
        totalAmount: totalAmount || 0,
      });

      res.status(201).json(savedBooking);
    } catch (error) {
      if (error instanceof Error && error.message === 'Client not found') {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Create Booking:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      const updatedBooking = await bookingsService.updateBooking(req.params.id, req.body);
      res.json({ success: true, data: updatedBooking });
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Update Booking:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      await bookingsService.deleteBooking(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Delete Booking:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    try {
      const booking = await bookingsService.getBookingById(req.params.id);
      res.json({
        success: true,
        data: booking,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Booking not found') {
        res.status(404).json({ success: false, message: 'Booking not found' });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in Get Booking:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await bookingsService.getAllBookings();
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Error in Get All Bookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getBookingsByClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;
    const bookings = await bookingsService.getBookingsByClient(clientId);
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Error in Get Bookings By Client:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
