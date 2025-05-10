import Client from '../../models/client.model';
import Event from '../../models/event.model';
import { IClientData } from '../../types/client.types';
import mongoose, { Types } from 'mongoose';
import { IBooking, IServiceProvider, IProduct } from '../../types/organization.types';

export class ClientsService {
  async createClient(clientData: IClientData, eventId?: string) {
    // Check if event exists when eventId is provided
    if (eventId) {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }
    }

    const client = new Client({
      ...clientData,
      eventId: eventId ? new Types.ObjectId(eventId) : undefined,
    });

    return await client.save();
  }

  async updateClient(clientId: string, updateData: Partial<IClientData>) {
    const client = await Client.findByIdAndUpdate(clientId, { $set: updateData }, { new: true });

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async deleteClient(clientId: string) {
    const client = await Client.findByIdAndDelete(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async markAttendance(clientId: string, status: boolean) {
    const client = await Client.findByIdAndUpdate(
      clientId,
      { $set: { attendance_status: status } },
      { new: true },
    );

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async markEmailSent(clientId: string) {
    const client = await Client.findByIdAndUpdate(clientId, { $set: { email_sent: true } }, { new: true });

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async updateReminderEmailDate(clientId: string, reminderEmailDate: Date) {
    const client = await Client.findByIdAndUpdate(
      clientId,
      { $set: { reminder_email_date: reminderEmailDate } },
      { new: true },
    );

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async getClientById(clientId: string) {
    const client = await Client.findById(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async getAllClients() {
    return await Client.find().sort({ createdAt: -1 });
  }

  async getClientsByEvent(eventId: string) {
    return await Client.find({ eventId: new Types.ObjectId(eventId) }).sort({ createdAt: -1 });
  }

  async addBookingToClient(clientId: string, bookingId: string) {
    const client = await Client.findByIdAndUpdate(
      clientId,
      { $push: { bookings: new Types.ObjectId(bookingId) } },
      { new: true },
    );

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async removeBookingFromClient(clientId: string, bookingId: string) {
    const client = await Client.findByIdAndUpdate(
      clientId,
      { $pull: { bookings: new Types.ObjectId(bookingId) } },
      { new: true },
    );

    if (!client) {
      throw new Error('Client not found');
    }

    return client;
  }

  async getClientWithBookings(clientId: string) {
    const client = await Client.findById(clientId).populate({
      path: 'bookings',
      options: { sort: { createdAt: -1 } },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    // Manually enrich bookings with service provider and product info from organizations
    if (client.bookings && client.bookings.length > 0) {
      const Organization = mongoose.model('Organization');

      // Get all organizations
      const organizations = await Organization.find();

      // Enrich each booking with service provider and product details
      for (const booking of client.bookings) {
        // Need to cast the booking to access its properties
        const bookingDoc = booking as unknown as IBooking;

        // Find service provider in organizations
        for (const org of organizations) {
          const serviceProvider = org.serviceProviders.find(
            (provider: IServiceProvider) =>
              provider._id && provider._id.toString() === bookingDoc.serviceProvider.toString(),
          );

          if (serviceProvider) {
            bookingDoc.serviceProvider = serviceProvider;
            break;
          }
        }

        // Find products in organizations
        if (bookingDoc.products && bookingDoc.products.length > 0) {
          const enrichedProducts: IProduct[] = [];

          for (const productId of bookingDoc.products) {
            let found = false;

            for (const org of organizations) {
              for (const category of org.productCategories) {
                const product = category.products.find(
                  (p: IProduct) => p._id && p._id.toString() === productId.toString(),
                );

                if (product) {
                  enrichedProducts.push(product);
                  found = true;
                  break;
                }
              }
              if (found) break;
            }
          }

          bookingDoc.products = enrichedProducts;
        }
      }
    }

    return client;
  }
}
