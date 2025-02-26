import cron from 'node-cron';
import ScheduledEmail from '../models/scheduledEmail.model';
import sendEmail from './mailgun.service';
import Guest from '../models/guest.model';

export function startEmailScheduler() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running email scheduler job...');

    try {
      const now = new Date();
      const threeHoursFromNow = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now

      // Find all pending emails scheduled within the next 72 hours
      const pendingEmails = await ScheduledEmail.find({
        status: 'pending',
        scheduledTime: { $lte: threeHoursFromNow, $gt: now },
      }).sort({ scheduledTime: 1 });

      console.log(`Found ${pendingEmails.length} pending emails to schedule`);

      for (const email of pendingEmails) {
        try {
          // Schedule the email with Mailgun
          const emailResult = await sendEmail(
            email.recipient,
            email.subject,
            email.htmlContent,
            email.scheduledTime,
          );

          // Update status to scheduled
          email.status = 'scheduled';
          await email.save();

          console.log(`Scheduled email to ${email.recipient} for ${email.scheduledTime}`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error(`Failed to schedule email to ${email.recipient}:`, error);

          // Mark as failed with error message
          email.status = 'failed';
          email.error = error.message;
          await email.save();
        }
      }

      // Check for emails that should have been sent by now
      const sentEmails = await ScheduledEmail.find({
        status: 'scheduled',
        scheduledTime: { $lt: now },
      });

      // Update their status to 'sent'
      for (const email of sentEmails) {
        email.status = 'sent';
        await email.save();

        // Update the guest's reminder_email_date if needed
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
