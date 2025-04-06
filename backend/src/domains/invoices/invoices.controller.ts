import { Request, Response } from 'express';
import multer from 'multer';
import { EventsService } from '../events/events.service';

const eventsService = new EventsService();
const upload = multer({ storage: multer.memoryStorage() });

export const getEventInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await eventsService.getEventInvoices(req.params.id);
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const uploadInvoice = async (req: Request, res: Response): Promise<void> => {
  upload.single('invoice')(req, res, async (err) => {
    if (err) {
      res.status(400).json({ success: false, message: 'File upload error' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    try {
      const invoice = await eventsService.uploadInvoice(req.params.id, req.file, req.body);
      if (!invoice) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      console.error('Error uploading invoice:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  });
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedInvoice = await eventsService.deleteInvoice(req.params.id);
    if (!deletedInvoice) {
      res.status(404).json({ success: false, message: 'Invoice not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const analyzeEventInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEvent = await eventsService.analyzeEventInvoices(req.params.id);
    if (!updatedEvent) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: updatedEvent.invoiceAnalysis,
    });
  } catch (error) {
    console.error('Error analyzing invoices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: errorMessage,
    });
  }
};