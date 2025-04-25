import { Request, Response } from 'express';
import { InvoicesService } from './invoices.service';

const invoicesService = new InvoicesService();

export const getEventInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await invoicesService.getEventInvoices(req.params.id);
    res.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const uploadInvoice = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }

  try {
    const invoice = await invoicesService.uploadInvoice(req.params.id, req.file, req.body);
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error uploading invoice:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedInvoice = await invoicesService.deleteInvoice(req.params.id);
    if (!deletedInvoice) {
      res.status(404).json({ success: false, message: 'IInvoice not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'IInvoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const analyzeEventInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEvent = await invoicesService.analyzeEventInvoices(req.params.id);
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
