import { EventsService } from '../events/events.service';
import { IInvoiceData } from '../../types/invoice.types';

export class InvoicesService {
  private eventsService = new EventsService();

  async getEventInvoices(eventId: string) {
    return await this.eventsService.getEventInvoices(eventId);
  }

  async uploadInvoice(eventId: string, file: Express.Multer.File, data: IInvoiceData) {
    return await this.eventsService.uploadInvoice(eventId, file, data);
  }

  async deleteInvoice(invoiceId: string) {
    return await this.eventsService.deleteInvoice(invoiceId);
  }

  async analyzeEventInvoices(eventId: string) {
    return await this.eventsService.analyzeEventInvoices(eventId);
  }
}
