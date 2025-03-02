import { Request, Response } from 'express';
import Invoice from '../models/invoice.model';
import Event from '../models/event.model';
import cloudinary from '../config/cloudinary';

export const uploadInvoice = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  try {
    // Check if event exists
    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Upload PDF to Cloudinary
    const base64Data = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;

    // Remove .pdf extension from the filename if it exists
    const filename = req.file.originalname.replace(/\.pdf$/i, '');

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'raw',
      folder: 'event_invoices',
      public_id: filename,
      access_mode: 'public',
    });

    // Create a direct URL to the PDF without adding an extra .pdf extension
    const pdfUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: 'raw',
      secure: true,
    });

    // Extract additional information from the request body if provided
    const { amount, date, vendor, category, isPaid } = req.body;

    // Create invoice with additional data if available
    const invoice = new Invoice({
      eventId: id,
      title: req.file.originalname.replace(/\.pdf$/i, ''),
      pdfUrl: pdfUrl,
      amount: amount ? parseFloat(amount) : undefined,
      date: date ? new Date(date) : new Date(), // Default to current date if not provided
      vendor: vendor || undefined,
      category: category || undefined,
      isPaid: isPaid === 'true' || isPaid === true || false,
    });

    await invoice.save();

    // Add invoice to event
    await Event.findByIdAndUpdate(id, {
      $push: { invoices: invoice._id },
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error: unknown) {
    console.error('Error uploading invoice:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getEventInvoices = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const invoices = await Invoice.find({ eventId: id }).sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    console.log(`Attempting to delete invoice with ID: ${id}`);

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      console.log(`Invoice with ID ${id} not found`);
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }

    console.log(`Found invoice: ${invoice._id}, eventId: ${invoice.eventId}`);

    // Delete PDF from Cloudinary if needed
    if (invoice.pdfUrl) {
      try {
        // Extract the public ID more carefully
        const match = invoice.pdfUrl.match(/event_invoices\/([^/]+)(?:\.[^.]+)?$/);
        const publicId = match ? match[1] : null;

        if (publicId) {
          console.log(`Attempting to delete from Cloudinary: event_invoices/${publicId}`);
          const cloudinaryResult = await cloudinary.uploader.destroy(`event_invoices/${publicId}`, {
            resource_type: 'raw',
          });
          console.log('Cloudinary delete result:', cloudinaryResult);
        } else {
          console.log('Could not extract public ID from URL:', invoice.pdfUrl);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
      }
    }

    // Remove invoice from event
    try {
      console.log(`Removing invoice ${invoice._id} from event ${invoice.eventId}`);
      const updateResult = await Event.findByIdAndUpdate(
        invoice.eventId,
        { $pull: { invoices: invoice._id } },
        { new: true },
      );
      console.log('Event update result:', updateResult ? 'Success' : 'No event found');
    } catch (eventError) {
      console.error('Error updating event:', eventError);
      // Continue with deletion even if event update fails
    }

    // Delete the invoice
    const deleteResult = await Invoice.findByIdAndDelete(id);
    console.log('Invoice delete result:', deleteResult ? 'Success' : 'Failed');

    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ success: false, message: 'Server Error', error: errorMessage });
  }
};
