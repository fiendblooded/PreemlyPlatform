import type { Request, Response } from 'express';
import { sendSMS } from './sms.service';

export const sendSMSController = async (req: Request, res: Response): Promise<void> => {
  const { template, phoneNumbers } = req.body;

  if (!template || !phoneNumbers || !Array.isArray(phoneNumbers)) {
    res.status(400).json({
      success: false,
      message: 'Please provide the text of the message and an array of phone numbers',
    });
    return;
  }

  try {
    const result = await sendSMS(phoneNumbers, template);

    res.status(200).json({
      success: true,
      message: result.data.message,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};
