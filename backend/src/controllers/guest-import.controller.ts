import type { Request, Response } from 'express';
import Guest from '../models/guest.model';
import type { GuestData } from '../types/guest.types';
import { parseExcelFile } from '../utils/excel-parser';

export const importGuestsFromExcel = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const guests: GuestData[] = await parseExcelFile(req.file.path);

    if (guests.length === 0) {
      return res.status(400).json({ message: 'No valid guests found in the file' });
    }

    const createdGuests = await Guest.create(guests);

    res.status(201).json({
      message: `Successfully imported ${createdGuests.length} guests`,
      guests: createdGuests,
    });
  } catch (error) {
    console.error('Error importing guests:', error);
    res.status(500).json({ message: 'Error importing guests', error });
  }
};

