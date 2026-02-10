import Guest from '../../models/guest.model';
import Event from '../../models/event.model';
import { IGuestData } from '../../types/guest.types';

export class GuestsService {
  async createGuest(guestData: IGuestData, eventId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const guest = new Guest({
      ...guestData,
      event: eventId
    });
    
    return await guest.save();
  }

  async updateGuest(guestId: string, updateData: Partial<IGuestData>) {
    const guest = await Guest.findByIdAndUpdate(
      guestId,
      { $set: updateData },
      { new: true }
    );
    
    if (!guest) {
      throw new Error('Guest not found');
    }
    
    return guest;
  }

  async deleteGuest(guestId: string) {
    const guest = await Guest.findByIdAndDelete(guestId);
    
    if (!guest) {
      throw new Error('Guest not found');
    }
    
    return guest;
  }

  async markAttendance(guestId: string, status: boolean) {
    const guest = await Guest.findByIdAndUpdate(
      guestId,
      { $set: { status } },
      { new: true }
    );
    
    if (!guest) {
      throw new Error('Guest not found');
    }
    
    return guest;
  }

  async markEmailSent(guestId: string) {
    const guest = await Guest.findByIdAndUpdate(
      guestId,
      { $set: { emailSent: true } },
      { new: true }
    );
    
    if (!guest) {
      throw new Error('Guest not found');
    }
    
    return guest;
  }

  async updateReminderEmailDate(guestId: string, reminderEmailDate: Date) {
    const guest = await Guest.findByIdAndUpdate(
      guestId,
      { $set: { reminderEmailDate } },
      { new: true }
    );
    
    if (!guest) {
      throw new Error('Guest not found');
    }
    
    return guest;
  }

  async getGuestById(guestId: string) {
    const guest = await Guest.findById(guestId);
    
    if (!guest) {
      throw new Error('Guest not found');
    }
    
    return guest;
  }

  async getAllGuests() {
    return await Guest.find();
  }

  async getGuestsByEvent(eventId: string) {
    return await Guest.find({ event: eventId });
  }
}
