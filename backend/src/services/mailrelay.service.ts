import axios from 'axios';
import dotenv from 'dotenv';
import type {
  EmailResponse,
  // EmailPayload
} from '../types/mail.types';

dotenv.config();

const mailrelayUrl = 'https://preemly.ipzmarketing.com/api/v1'; //process.env.MAILRELAY_URL;
const mailrelayKey = 'iXRJq_CP5kbW7BbP5SaNoXXRKkzxZL_VH5RBV24_'; //process.env.MAILRELAY_KEY;

if (!mailrelayUrl || !mailrelayKey) {
  throw new Error('MAILRELAY_URL or MAILRELAY_KEY is not defined in the environment variables');
}

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
  // scheduledTime?: Date,
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
      const emailPayload = {
        'from': {
          'email': 'noreply@mail.preemly.eu',
          'name': 'Preemly'
        },
        'to': [{
          'email': recipient,
          'name': 'Dear User'
        }],
        'subject': subject,
        'html_part': '<html>\n<head></head>\n<body><p>My html content.</p>' // htmlContents[i],
      };
      console.log('htmlContents', htmlContents[i]);
      console.log('emailPayload123', emailPayload);
      // if (scheduledTime && scheduledTime > new Date()) {
      //   emailPayload['scheduled_time'] = Math.floor(scheduledTime.getTime() / 1000).toString();
      // }

      // if (i > 0) {
      //   await delay(200);
      // }

      const response = await axios.post(`${mailrelayUrl}/send_emails`, emailPayload, {
        headers: {
          'X-AUTH-TOKEN': mailrelayKey,
          'Content-Type': 'application/json',
        },
      });

      responses.push(response.data);
    }

    return responses[0];
  } catch (error) {
    console.error('Error sending email with Mailrelay:', JSON.stringify(error));
    throw error;
  }
};

export default sendEmail;