import { Request, Response } from 'express';
import Event from '../models/event.model';
import Invoice from '../models/invoice.model';
import { extractTextFromPdf } from '../services/pdf.service';
import { analyzeInvoices } from '../services/openai.service';

export const analyzeEventInvoices = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Find the event and populate invoices
    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    // Get all invoices for the event
    const invoices = await Invoice.find({ eventId: id });
    if (invoices.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No invoices found for this event',
      });
      return;
    }

    // Extract text from each invoice PDF
    const invoiceTexts: string[] = [];
    const invoiceData = [];

    for (const invoice of invoices) {
      try {
        const text = await extractTextFromPdf(invoice.pdfUrl);
        invoiceTexts.push(text);

        // Add structured data about the invoice
        invoiceData.push({
          id: invoice._id.toString(),
          title: invoice.title,
          amount: invoice.amount,
          date: invoice.date,
          vendor: invoice.vendor,
          category: invoice.category,
          isPaid: invoice.isPaid,
        });
      } catch (error) {
        console.error(`Error processing invoice ${invoice._id}:`, error);
        // Continue with other invoices even if one fails
      }
    }

    if (invoiceTexts.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Failed to extract text from any invoices',
      });
      return;
    }

    // Analyze the invoices using OpenAI
    const analysis = await analyzeInvoices(invoiceTexts);

    // Update the event with the analysis results
    event.invoiceAnalysis = {
      ...analysis,
      lastUpdated: new Date(),
    };

    await event.save();

    res.status(200).json({
      success: true,
      data: event.invoiceAnalysis,
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
