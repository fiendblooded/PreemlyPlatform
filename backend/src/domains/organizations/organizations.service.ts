import Organization from '../../models/organization.model';
import Booking from '../../models/booking.model';
import { 
  IOrganization, 
  IOrganizationData, 
  IProductCategory, 
  IServiceProvider,
  IServiceDate,
  IBooking,
  IClient,
  IRating
} from '../../types/organization.types';
import { v2 as cloudinary } from 'cloudinary';
import sendEmail from '../mails/mail.service';

export class OrganizationsService {
  async getAllOrganizations(): Promise<IOrganization[]> {
    return await Organization.find().sort({ createdAt: -1 });
  }

  async getOrganizationById(id: string): Promise<IOrganization | null> {
    return await Organization.findById(id).populate('bookings');
  }

  async getOrganizationsByOwnerId(ownerId: string): Promise<IOrganization[]> {
    return await Organization.find({ ownerId }).sort({ createdAt: -1 });
  }

  async createOrganization(organizationData: IOrganizationData): Promise<IOrganization> {
    let imageUrl = '';

    if (organizationData.image && organizationData.image.trim() !== '') {
      const uploadResponse = await cloudinary.uploader.upload(organizationData.image, {
        folder: 'organizations_images',
      });
      imageUrl = uploadResponse.secure_url;
    }

    const organization = new Organization({
      ...organizationData,
      image: imageUrl || organizationData.image,
      productCategories: organizationData.productCategories || [],
      serviceProviders: organizationData.serviceProviders || [],
      serviceDates: organizationData.serviceDates || [],
      bookings: [],
      ratings: []
    });

    return await organization.save();
  }

  async updateOrganization(
    id: string, 
    organizationData: Partial<IOrganizationData>
  ): Promise<IOrganization | null> {
    const updateData = { ...organizationData };
    
    if (updateData.image && updateData.image.trim() !== '' && updateData.image.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(updateData.image, {
        folder: 'organizations_images',
      });
      updateData.image = uploadResponse.secure_url;
    }
    
    return await Organization.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true }
    );
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const result = await Organization.findByIdAndDelete(id);
    return !!result;
  }

  async addProductCategory(
    organizationId: string, 
    category: IProductCategory
  ): Promise<IOrganization | null> {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { productCategories: category } },
      { new: true }
    );
  }

  async updateProductCategory(
    organizationId: string,
    categoryId: string,
    categoryData: Partial<IProductCategory>
  ): Promise<IOrganization | null> {
    const organization = await Organization.findById(organizationId);
    
    if (!organization) return null;

    const categoryIndex = organization.productCategories.findIndex(
      cat => cat._id?.toString() === categoryId
    );

    if (categoryIndex === -1) return null;

    if (categoryData.name) {
      organization.productCategories[categoryIndex].name = categoryData.name;
    }

    if (categoryData.products) {
      organization.productCategories[categoryIndex].products = categoryData.products;
    }

    return await organization.save();
  }

  async deleteProductCategory(
    organizationId: string,
    categoryId: string
  ): Promise<IOrganization | null> {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $pull: { productCategories: { _id: categoryId } } },
      { new: true }
    );
  }

  async addServiceProvider(
    organizationId: string,
    provider: IServiceProvider
  ): Promise<IOrganization | null> {
    let imageUrl = '';

    if (provider.image && provider.image.trim() !== '' && provider.image.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(provider.image, {
        folder: 'organizations_providers',
      });
      imageUrl = uploadResponse.secure_url;
    } else if (provider.image) {
      imageUrl = provider.image;
    }

    const serviceProvider = {
      ...provider,
      image: imageUrl
    };

    return await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { serviceProviders: serviceProvider } },
      { new: true }
    );
  }

  async updateServiceProvider(
    organizationId: string,
    providerId: string,
    providerData: Partial<IServiceProvider>
  ): Promise<IOrganization | null> {
    const organization = await Organization.findById(organizationId);
    
    if (!organization) return null;

    const providerIndex = organization.serviceProviders.findIndex(
      provider => provider._id?.toString() === providerId
    );

    if (providerIndex === -1) return null;

    if (providerData.name) {
      organization.serviceProviders[providerIndex].name = providerData.name;
    }

    if (providerData.description) {
      organization.serviceProviders[providerIndex].description = providerData.description;
    }

    if (providerData.image && providerData.image.trim() !== '') {
      if (providerData.image.startsWith('data:image')) {
        const uploadResponse = await cloudinary.uploader.upload(providerData.image, {
          folder: 'organizations_providers',
        });
        organization.serviceProviders[providerIndex].image = uploadResponse.secure_url;
      } else {
        organization.serviceProviders[providerIndex].image = providerData.image;
      }
    }

    return await organization.save();
  }

  async deleteServiceProvider(
    organizationId: string,
    providerId: string
  ): Promise<IOrganization | null> {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $pull: { serviceProviders: { _id: providerId } } },
      { new: true }
    );
  }

  async addServiceDate(
    organizationId: string,
    serviceDate: IServiceDate
  ): Promise<IOrganization | null> {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { serviceDates: serviceDate } },
      { new: true }
    );
  }

  async updateServiceDate(
    organizationId: string,
    serviceDateId: string,
    serviceDateData: Partial<IServiceDate>
  ): Promise<IOrganization | null> {
    const organization = await Organization.findById(organizationId);
    
    if (!organization) return null;

    const dateIndex = organization.serviceDates.findIndex(
      date => date._id && date._id.toString() === serviceDateId
    );

    if (dateIndex === -1) return null;

    if (serviceDateData.date) {
      organization.serviceDates[dateIndex].date = serviceDateData.date;
    }

    if (serviceDateData.timeSlots) {
      organization.serviceDates[dateIndex].timeSlots = serviceDateData.timeSlots;
    }

    return await organization.save();
  }

  async deleteServiceDate(
    organizationId: string,
    serviceDateId: string
  ): Promise<IOrganization | null> {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $pull: { serviceDates: { _id: serviceDateId } } },
      { new: true }
    );
  }

  async createBooking(
    organizationId: string,
    bookingData: {
      serviceProviderId: string,
      serviceDate: Date,
      serviceTime: string,
      client: IClient
    }
  ): Promise<IBooking | null> {
    const organization = await Organization.findById(organizationId);
    if (!organization) return null;

    const serviceProvider = organization.serviceProviders.find(
      provider => provider._id?.toString() === bookingData.serviceProviderId
    );
    if (!serviceProvider) return null;

    const booking = new Booking({
      serviceProvider: serviceProvider._id,
      serviceDate: bookingData.serviceDate,
      serviceTime: bookingData.serviceTime,
      client: bookingData.client
    });

    const savedBooking = await booking.save();

    await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { bookings: savedBooking._id } }
    );

    await this.sendBookingConfirmationEmail(organization, serviceProvider, savedBooking);

    return savedBooking;
  }

  private async sendBookingConfirmationEmail(
    organization: IOrganization,
    provider: IServiceProvider,
    booking: IBooking
  ): Promise<void> {
    try {
      const { client, serviceDate, serviceTime } = booking;
      const formattedDate = new Date(serviceDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const subject = `Booking Confirmation | ${organization.name}`;

      const latitude = organization.location.latitude;
      const longitude = organization.location.longitude;
      const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Booking Confirmation</h2>
          
          <p>Hello, ${client.firstName} ${client.lastName}!</p>
          <p>Your booking has been successfully confirmed.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Booking Details:</h3>
            <p><strong>Organization:</strong> ${organization.name}</p>
            <p><strong>Service Provider:</strong> ${provider.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${serviceTime}</p>
          </div>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #333;">Location:</h3>
            <p>${organization.location.address}</p>
            <p><a href="${mapLink}">Open on map</a></p>
          </div>

          ${client.comment ? `<p><strong>Your comment:</strong> ${client.comment}</p>` : ''}
          
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #777; text-align: center;">
            If you have any questions or need to change your booking, please contact us directly.
          </p>
        </div>
      `;

      await sendEmail([client.email], subject, [htmlContent]);
      console.log(`Booking confirmation email sent to ${client.email}`);
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
    }
  }

  async addRating(
    organizationId: string,
    rating: IRating
  ): Promise<IOrganization | null> {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $push: { ratings: rating } },
      { new: true }
    );
  }

  async getAverageRating(organizationId: string): Promise<number | null> {
    const organization = await Organization.findById(organizationId);
    if (!organization || organization.ratings.length === 0) return null;

    const totalRating = organization.ratings.reduce((sum, rating) => sum + rating.score, 0);
    return totalRating / organization.ratings.length;
  }
} 