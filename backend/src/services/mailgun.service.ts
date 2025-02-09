import formData from 'form-data';
import Mailgun from 'mailgun.js';
import dotenv from 'dotenv';
import type {
  MailgunClientOptions,
  EmailResponse,
  EmailPayload
} from '../types/mail.types';

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
): Promise<EmailResponse> => {
  if (Array.isArray(recipient)) {
    for (const email of recipient) {
      if (!validateEmail(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }
  } else if (!validateEmail(recipient)) {
    throw new Error(`Invalid email address: ${recipient}`);
  }

  try {
    const emailPayload: EmailPayload = {
      from: 'Preemly <mailgun@mail.preemly.eu>',
      to: recipient,
      subject: subject,
      html: htmlContent,
    };

    const response = await mg.messages.create('mail.preemly.eu', emailPayload);
    return response as EmailResponse;
  } catch (error) {
    console.error('Error sending email with Mailgun:', error);
    throw error;
  }
};

export default sendEmail;

