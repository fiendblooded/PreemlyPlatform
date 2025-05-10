import { Request, Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { AuthRequest } from '../../types/auth.types';
import { IRating } from '../../types/organization.types';

const organizationsService = new OrganizationsService();

export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizations = await organizationsService.getAllOrganizations();
    res.json({ success: true, data: organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getOrganizationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = req.params.id;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    res.json({ success: true, data: organization });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getMyOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organizations = await organizationsService.getOrganizationsByOwnerId(req.user.sub);
    res.json({ success: true, data: organizations });
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { name, image, location, description, productCategories, serviceProviders, serviceDates } =
      req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Name is required',
      });
      return;
    }

    if (image && !image.startsWith('data:image')) {
      res.status(400).json({
        success: false,
        message: 'Image must be a valid base64 encoded image',
      });
      return;
    }

    const organizationData = {
      name,
      image,
      location,
      description,
      productCategories,
      serviceProviders,
      serviceDates,
      ownerId: req.user.sub,
    };

    const organization = await organizationsService.createOrganization(organizationData);
    res.status(201).json({ success: true, data: organization });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organizationId = req.params.id;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (organization.ownerId !== req.user.sub) {
      res.status(403).json({ success: false, message: 'Not authorized to update this organization' });
      return;
    }

    const { name, image, location, description } = req.body;

    if (image && !image.startsWith('data:image') && !image.startsWith('http')) {
      res.status(400).json({
        success: false,
        message: 'Image must be a valid base64 encoded image or URL',
      });
      return;
    }

    const updatedOrganization = await organizationsService.updateOrganization(organizationId, {
      name,
      image,
      location,
      description,
    });

    res.json({ success: true, data: updatedOrganization });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organizationId = req.params.id;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (organization.ownerId !== req.user.sub) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this organization' });
      return;
    }

    const success = await organizationsService.deleteOrganization(organizationId);

    if (!success) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addProductCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organizationId = req.params.id;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (organization.ownerId !== req.user.sub) {
      res.status(403).json({ success: false, message: 'Not authorized to update this organization' });
      return;
    }

    const { name, products } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const updatedOrganization = await organizationsService.addProductCategory(organizationId, {
      name,
      products: products || [],
    });

    res.json({ success: true, data: updatedOrganization });
  } catch (error) {
    console.error('Error adding product category:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateProductCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { organizationId, categoryId } = req.params;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (organization.ownerId !== req.user.sub) {
      res.status(403).json({ success: false, message: 'Not authorized to update this organization' });
      return;
    }

    const { name, products } = req.body;
    const updatedOrganization = await organizationsService.updateProductCategory(organizationId, categoryId, {
      name,
      products,
    });

    if (!updatedOrganization) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.json({ success: true, data: updatedOrganization });
  } catch (error) {
    console.error('Error updating product category:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteProductCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { organizationId, categoryId } = req.params;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (organization.ownerId !== req.user.sub) {
      res.status(403).json({ success: false, message: 'Not authorized to update this organization' });
      return;
    }

    const updatedOrganization = await organizationsService.deleteProductCategory(organizationId, categoryId);

    if (!updatedOrganization) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.json({ success: true, data: updatedOrganization });
  } catch (error) {
    console.error('Error deleting product category:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addServiceProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organizationId = req.params.id;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (organization.ownerId !== req.user.sub) {
      res.status(403).json({ success: false, message: 'Not authorized to update this organization' });
      return;
    }

    const { name, description, image } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Provider name is required' });
      return;
    }

    if (image && !image.startsWith('data:image') && !image.startsWith('http')) {
      res.status(400).json({
        success: false,
        message: 'Image must be a valid base64 encoded image or URL',
      });
      return;
    }

    const updatedOrganization = await organizationsService.addServiceProvider(organizationId, {
      name,
      description,
      image,
    });

    res.json({ success: true, data: updatedOrganization });
  } catch (error) {
    console.error('Error adding service provider:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateServiceProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { organizationId, providerId } = req.params;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (organization.ownerId !== req.user.sub) {
      res.status(403).json({ success: false, message: 'Not authorized to update this organization' });
      return;
    }

    const { name, description, image } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Provider name is required' });
      return;
    }

    if (image && !image.startsWith('data:image') && !image.startsWith('http')) {
      res.status(400).json({
        success: false,
        message: 'Image must be a valid base64 encoded image or URL',
      });
      return;
    }

    const updatedOrganization = await organizationsService.updateServiceProvider(organizationId, providerId, {
      name,
      description,
      image,
    });

    if (!updatedOrganization) {
      res.status(404).json({ success: false, message: 'Service provider not found' });
      return;
    }

    res.json({ success: true, data: updatedOrganization });
  } catch (error) {
    console.error('Error updating service provider:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addServiceDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const organizationId = req.params.id;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    if (organization.ownerId !== req.user.sub) {
      res.status(403).json({ success: false, message: 'Not authorized to update this organization' });
      return;
    }

    const { date, timeSlots } = req.body;

    if (!date || !timeSlots || !Array.isArray(timeSlots)) {
      res.status(400).json({
        success: false,
        message: 'Date and time slots are required',
      });
      return;
    }

    const updatedOrganization = await organizationsService.addServiceDate(organizationId, {
      date: new Date(date),
      timeSlots,
    });

    res.json({ success: true, data: updatedOrganization });
  } catch (error) {
    console.error('Error adding service date:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = req.params.id;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    const { serviceProviderId, serviceDate, serviceTime, client } = req.body;

    if (!serviceProviderId || !serviceDate || !serviceTime || !client) {
      res.status(400).json({
        success: false,
        message: 'Service provider, date, time, and client information are required',
      });
      return;
    }

    if (!client.firstName || !client.lastName || !client.email || !client.phone) {
      res.status(400).json({
        success: false,
        message: 'Client first name, last name, email, and phone are required',
      });
      return;
    }

    const booking = await organizationsService.createBooking(organizationId, {
      serviceProviderId,
      serviceDate: new Date(serviceDate),
      serviceTime,
      client,
    });

    if (!booking) {
      res.status(400).json({ success: false, message: 'Failed to create booking' });
      return;
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const addRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = req.params.id;
    const organization = await organizationsService.getOrganizationById(organizationId);

    if (!organization) {
      res.status(404).json({ success: false, message: 'Organization not found' });
      return;
    }

    const { score, comment, clientId } = req.body;

    if (!score || score < 1 || score > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating score is required and must be between 1 and 5',
      });
      return;
    }

    const rating: IRating = {
      score,
      comment,
      clientId,
      createdAt: new Date(),
    };

    const updatedOrganization = await organizationsService.addRating(organizationId, rating);
    res.json({ success: true, data: updatedOrganization });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAverageRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = req.params.id;
    const averageRating = await organizationsService.getAverageRating(organizationId);

    if (averageRating === null) {
      res.json({ success: true, data: { averageRating: 0, ratingsCount: 0 } });
      return;
    }

    const organization = await organizationsService.getOrganizationById(organizationId);
    const ratingsCount = organization?.ratings.length || 0;

    res.json({
      success: true,
      data: {
        averageRating,
        ratingsCount,
      },
    });
  } catch (error) {
    console.error('Error getting average rating:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
