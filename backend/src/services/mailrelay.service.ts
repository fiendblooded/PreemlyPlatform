import axios from 'axios';
import dotenv from 'dotenv';
import type { EmailResponse } from '../types/mail.types';

dotenv.config();

const mailrelayUrl = process.env.MAILRELAY_URL || 'https://preemly.ipzmarketing.com/api/v1';
const mailrelayKey = process.env.MAILRELAY_KEY || 'iXRJq_CP5kbW7BbP5SaNoXXRKkzxZL_VH5RBV24_';

if (!mailrelayUrl || !mailrelayKey) {
  throw new Error('MAILRELAY_URL or MAILRELAY_KEY is not defined in the environment variables');
}

const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const sendEmail = async (
  recipients: string[],
  subject: string,
  htmlContents: string[],
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
        from: {
          email: 'bmyrinets@preemly.eu',
          name: 'Preemly',
        },
        to: [{
          email: recipient,
          name: 'Dear User',
        }],
        subject: subject,
        html_part: htmlContents[i] || '<html>\n<head></head>\n<body><p>My html content.</p></body>\n</html>',
        text_part_auto: true, // Добавлено
        headers: { 'X-CustomHeader': 'Header value' }, // Добавлено
        smtp_tags: ['example_tag'], // Добавлено
      };

      console.log('htmlContents', htmlContents[i]);
      console.log('emailPayload', emailPayload);

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
    if (axios.isAxiosError(error)) {
      console.error('Error sending email with Mailrelay:', JSON.stringify({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }));
    } else {
      console.error('Unexpected error:', JSON.stringify(error));
    }
    throw error;
  }
};

export default sendEmail;