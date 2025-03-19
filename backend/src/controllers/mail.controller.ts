import type { Request, Response } from 'express';
// import sendEmail from '../services/mailgun.service';
import ScheduledEmail from '../models/scheduledEmail.model';
import mongoose from 'mongoose';
import type { EmailData } from '../types/mail.types';
import Guest from '../models/guest.model';
import sendEmail from '../services/mailrelay.service';

export const sendMailController = async (req: Request, res: Response): Promise<void> => {
  const { subject, htmlTemplate, emails } = req.body;

  if (!subject || !htmlTemplate || !emails || !Array.isArray(emails)) {
    res.status(400).json({
      success: false,
      message: 'Please provide all fields. Emails must be an array.',
    });
    return;
  }

  try {
    const recipients: string[] = [];
    const personalizedHtmlContents: string[] = [];
    
    for (const email of emails as EmailData[]) {
      if (!email.recipient || !email.guestName || !email.qrCode) {
        throw new Error('Each email must contain recipient, guestName and qrCode');
      }
      
      recipients.push(email.recipient);
      
      let content = htmlTemplate;
      content = content.replace(/{{guestName}}/g, email.guestName);
      content = content.replace(/{{qrCode}}/g, email.qrCode);
      personalizedHtmlContents.push(content);
    }

    await sendEmail(recipients, subject, personalizedHtmlContents);
    res.status(204).send();
  } catch (error) {
    console.error('Error in Send Email:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server Error',
    });
  }
};

export const scheduleReminderEmailsController = async (req: Request, res: Response): Promise<void> => {
  const { eventId, guests, reminderTime, emailSubject, emailsData } = req.body;

  if (!eventId || !guests || !reminderTime || !emailSubject || !emailsData) {
    res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
    return;
  }

  try {
    const now = new Date();
    const scheduledTime = new Date(reminderTime);

    if (scheduledTime <= now) {
      res.status(400).json({
        success: false,
        message: 'Reminder time must be in the future',
      });
      return;
    }

    const scheduledEmails = [];
    const threeHoursFromNow = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now

    for (let i = 0; i < emailsData.length; i++) {
      const emailData = emailsData[i];
      const { recipient, htmlContent } = emailData;
      const guestId = guests[i]?.guestId;

      if (!guestId) {
        console.error('Missing guestId for email', i);
        continue;
      }

      const scheduledEmail = new ScheduledEmail({
        eventId: new mongoose.Types.ObjectId(eventId),
        guestId: new mongoose.Types.ObjectId(guestId),
        recipient,
        subject: emailSubject,
        htmlContent,
        scheduledTime,
        status: 'pending',
      });

      await scheduledEmail.save();

      if (scheduledTime <= threeHoursFromNow) {
        try {
          const emailResult = await sendEmail(recipient, emailSubject, htmlContent/**, scheduledTime*/);

          scheduledEmail.status = 'scheduled';
          await scheduledEmail.save();

          scheduledEmails.push({
            email: recipient,
            scheduledTime: scheduledTime,
            result: emailResult,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          scheduledEmail.status = 'failed';
          scheduledEmail.error = error.message;
          await scheduledEmail.save();

          console.error(`Failed to schedule email for ${recipient}:`, error);
        }
      } else {
        scheduledEmails.push({
          email: recipient,
          scheduledTime: scheduledTime,
          status: 'pending',
        });
      }
    }


    res.status(200).json({
      success: true,
      message: `Reminder emails scheduled for ${emailsData.length} guests at ${scheduledTime.toISOString()}`,
      scheduledEmails: scheduledEmails,
    });
  } catch (error) {
    console.error('Error scheduling reminder emails:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const getScheduledEmailsController = async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.params;

  if (!eventId) {
    res.status(400).json({
      success: false,
      message: 'Event ID is required',
    });
    return;
  }

  try {
    const scheduledEmails = await ScheduledEmail.find({
      eventId: new mongoose.Types.ObjectId(eventId),
    });

    res.status(200).json({
      success: true,
      data: scheduledEmails,
    });
  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const updateEmailStatusController = async (req: Request, res: Response): Promise<void> => {
  const { guestIds } = req.body;

  if (!guestIds || !Array.isArray(guestIds)) {
    res.status(400).json({
      success: false,
      message: 'Please provide an array of guest IDs',
    });
    return;
  }

  try {
    await Guest.updateMany(
      { _id: { $in: guestIds.map(id => new mongoose.Types.ObjectId(id)) } },
      { $set: { email_sent: true } }
    );

    res.status(200).json({
      success: true,
      message: `Email status updated for ${guestIds.length} guests`,
    });
  } catch (error) {
    console.error('Error updating email status:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Server Error',
    });
  }
};
