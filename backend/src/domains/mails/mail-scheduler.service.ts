import cron from 'node-cron';
import IScheduledEmail from '../../models/scheduled-email.model';
import sendEmail from './mail.service';
import Guest from '../../models/guest.model';
import Event from '../../models/event.model';

export function startEmailScheduler() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running email scheduler job...');

    try {
      const now = new Date();
      const threeHoursFromNow = new Date(now.getTime() + 72 * 60 * 60 * 1000);

      const pendingEmails = await IScheduledEmail.find({
        status: 'pending',
        scheduledTime: { $lte: threeHoursFromNow, $gt: now },
      }).sort({ scheduledTime: 1 });

      console.log(`Found ${pendingEmails.length} pending emails to schedule`);

      for (const email of pendingEmails) {
        try {
          const event = await Event.findById(email.eventId);
          if (!event) {
            console.error(`Event not found for scheduled email ${email._id}`);
            continue;
          }

          await sendEmail(
            [email.recipient],
            email.subject,
            [email.htmlContent],
            email.scheduledTime,
            event.emailParams.emailIdentifier,
          );

          email.status = 'scheduled';
          await email.save();

          console.log(`Scheduled email to ${email.recipient} for ${email.scheduledTime}`);
        } catch (error) {
          console.error(`Failed to schedule email to ${email.recipient}:`, error);

          email.status = 'failed';
          email.error = error instanceof Error ? error.message : String(error);
          await email.save();
        }
      }

      // Check for emails that should have been sent by now
      const sentEmails = await IScheduledEmail.find({
        status: 'scheduled',
        scheduledTime: { $lt: now },
      });

      for (const email of sentEmails) {
        email.status = 'sent';
        await email.save();

        try {
          const guest = await Guest.findById(email.guestId);
          if (guest) {
            guest.reminder_email_date = email.scheduledTime;
            await guest.save();
          }
        } catch (err) {
          console.error(`Error updating guest reminder status for ${email.guestId}:`, err);
        }
      }

      console.log(`Updated ${sentEmails.length} emails to 'sent' status`);
    } catch (error) {
      console.error('Error in email scheduler job:', error);
    }
  });

  console.log('Email scheduler started');
}
