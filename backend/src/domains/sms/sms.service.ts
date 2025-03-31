import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface SMSResponse {
  data: {
    status: string;
    message: string;
  };
}

const BULKGATE_API_URL = 'https://portal.bulkgate.com/api/1.0/simple/transactional';
const BULKGATE_APP_ID = process.env.BULKGATE_APP_ID;
const BULKGATE_APP_TOKEN = process.env.BULKGATE_APP_TOKEN;
const BULKGATE_SENDER_ID = 16407;
const BULKGATE_SENDER_ID_VALUE = 'gText';

if (!BULKGATE_APP_ID || !BULKGATE_APP_TOKEN) {
  throw new Error('BULKGATE_APP_ID and BULKGATE_APP_TOKEN must be defined in the environment variables.');
}

export const sendSMS = async (phoneNumbers: string[], message: string): Promise<SMSResponse> => {
  try {
    const messageWithSignature = `${message}\n\nPreemly`;

    Promise.all(
      phoneNumbers.map(async (phone) => {
        try {
          const response = await axios.post(BULKGATE_API_URL, {
            application_id: BULKGATE_APP_ID,
            application_token: BULKGATE_APP_TOKEN,
            number: phone,
            text: messageWithSignature,
            sender_id: BULKGATE_SENDER_ID,
            sender_id_value: BULKGATE_SENDER_ID_VALUE,
          });
          console.log(`SMS successfully sent to ${phone}`);
          return response.data;
        } catch (error) {
          console.error(`Error sending SMS to ${phone}:`, error);
          return null;
        }
      })
    ).catch((error) => {
      console.error('Error in bulk SMS sending process:', error);
    });

    return {
      data: {
        status: 'processing',
        message: `SMS queued for sending to ${phoneNumbers.length} recipients`,
      },
    };
  } catch (error) {
    throw new Error(`SMS preparation error: ${error instanceof Error 
      ? error.message 
      : 'Internal server error'}`
    );
  }
};
