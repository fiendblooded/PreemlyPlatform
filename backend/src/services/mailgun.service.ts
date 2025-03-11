import formData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';
import type { MailgunClientOptions, EmailResponse, EmailPayload } from '../types/mail.types';

dotenv.config();

const mailgun = new Mailgun(formData);
const key = process.env.MAILGUN_KEY;

if (!key) {
  throw new Error('MAILGUN_KEY is not defined in the environment variables');
}

const mailgunConfig: MailgunClientOptions = {
  username: 'api',
  key: key,
  url: 'https://api.eu.mailgun.net',
};

const mg = mailgun.client(mailgunConfig);

const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const sendEmail = async (
  recipient: string | string[],
  subject: string,
  htmlContent: string,
  scheduledTime?: Date,
): Promise<EmailResponse[]> => {
  const recipients = Array.isArray(recipient) ? recipient : [recipient];

  for (const email of recipients) {
    if (!validateEmail(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
  }

  const responses: EmailResponse[] = [];
  const chunkSize = 26;

  for (let i = 0; i < recipients.length; i += chunkSize) {
    const chunk = recipients.slice(i, i + chunkSize);

    try {
      const emailPayload: EmailPayload = {
        from: 'Preemly <noreply@mail.preemly.eu>',
        to: chunk,
        subject: subject,
        html: htmlContent,
      };

      if (scheduledTime && scheduledTime > new Date()) {
        emailPayload['o:deliverytime'] = Math.floor(scheduledTime.getTime() / 1000).toString();
      }

      const response = await mg.messages.create('mail.preemly.eu', emailPayload);
      responses.push(response as EmailResponse);
    } catch (error) {
      console.error('Error sending email with Mailgun:', error);
      throw error;
    }
  }

  return responses;
};

export default sendEmail;