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

if (!BULKGATE_APP_ID || !BULKGATE_APP_TOKEN) {
  throw new Error('BULKGATE_APP_ID and BULKGATE_APP_TOKEN must be defined in the environment variables.');
}

export const sendSMS = async (phoneNumbers: string[], message: string): Promise<SMSResponse> => {
  try {
    const responses = await Promise.all(
      phoneNumbers.map(async (phone) => {
        const updatedMessage = message; // TODO: add url for user's qr code

        const response = await axios.post(BULKGATE_API_URL, {
          application_id: BULKGATE_APP_ID,
          application_token: BULKGATE_APP_TOKEN,
          number: phone,
          text: updatedMessage,
        });
        return response.data;
      })
    );

    return {
      data: {
        status: 'success',
        message: `SMS sent successfully to ${responses.length} recipients`,
      },
    };
  } catch (error) {
    throw new Error(`SMS sending error: ${error instanceof Error
      ? error.message
      : 'Internal server error'}`
    );
  }
};
