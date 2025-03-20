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

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Основная функция для отправки email
const sendEmail = async (
  recipients: string[],
  subject: string,
  htmlContents: string[],
  scheduledTime?: Date,
): Promise<EmailResponse> => {
  // Валидируем все email адреса
  for (const email of recipients) {
    if (!validateEmail(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
  }

  try {
    const responses = [];
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const emailPayload: EmailPayload = {
        from: 'Preemly <noreply@mail.preemly.eu>',
        to: recipient,
        subject: subject,
        html: htmlContents[i],
      };

      if (scheduledTime && scheduledTime > new Date()) {
        emailPayload['o:deliverytime'] = Math.floor(scheduledTime.getTime() / 1000).toString();
      }

      // if (i > 0) {
      //   await delay(200);
      // }

      const response = await mg.messages.create('mail.preemly.eu', emailPayload);
      responses.push(response);
    }

    return responses[0] as EmailResponse;
  } catch (error) {
    console.error('Error sending email with Mailgun:', error);
    throw error;
  }
};

export default sendEmail;
