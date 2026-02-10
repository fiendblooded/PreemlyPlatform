import Booking from '../../models/booking.model';
import Client from '../../models/client.model';
import { Types } from 'mongoose';
import { IBooking } from '../../types/organization.types';

export class BookingsService {
  async createBooking(bookingData: {
    serviceProvider: Types.ObjectId;
    serviceDate: Date;
    serviceTime: string;
    client: Types.ObjectId;
    products?: Types.ObjectId[];
    totalAmount?: number;
  }): Promise<IBooking> {
    // Verify client exists
    const clientExists = await Client.findById(bookingData.client);
    if (!clientExists) {
      throw new Error('Client not found');
    }

    const booking = new Booking({
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedBooking = await booking.save();

    // Add booking reference to client
    await Client.findByIdAndUpdate(bookingData.client, { $push: { bookings: savedBooking._id } });

    // Return the booking without populating service provider and products
    return savedBooking;
  }

  async updateBooking(bookingId: string, updateData: Partial<IBooking>): Promise<IBooking> {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { ...updateData, updatedAt: new Date() },
      { new: true },
    );

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  async deleteBooking(bookingId: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Remove booking reference from client
    if (booking.client) {
      await Client.findByIdAndUpdate(booking.client, { $pull: { bookings: booking._id } });
    }

    await Booking.findByIdAndDelete(bookingId);

    return booking;
  }

  async getBookingById(bookingId: string): Promise<IBooking> {
    const booking = await Booking.findById(bookingId).populate('client');

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  async getAllBookings(): Promise<IBooking[]> {
    return await Booking.find().populate('client').sort({ createdAt: -1 });
  }

  async getBookingsByClient(clientId: string): Promise<IBooking[]> {
    return await Booking.find({ client: new Types.ObjectId(clientId) }).sort({ createdAt: -1 });
  }
}
