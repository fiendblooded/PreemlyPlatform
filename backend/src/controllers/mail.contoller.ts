import type { Request, Response } from 'express';
import sendEmail from '../services/mailgun.service';

export const sendMailController = async (req: Request, res: Response): Promise<void> => {
  const { recipient, subject, htmlContent } = req.body;

  if (!recipient || !subject || !htmlContent) {
    res.status(400).json({
      success: false,
      message: 'Please provide all fields',
    });
    return;
  }

  try {
    console.log('Data:', recipient, subject, htmlContent);
    await sendEmail(recipient, subject, htmlContent);
    res.status(204).send();
  } catch (error) {
    console.error('Error in Send Email:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
