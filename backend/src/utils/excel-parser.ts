import xlsx from 'xlsx';
import type { GuestData } from '../types/guest.types';

export const parseExcelFile = (filePath: string): Promise<GuestData[]> => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = xlsx.utils.sheet_to_json(worksheet);

      const guests: GuestData[] = data.map((row) => ({
        fullName: row['Full Name'],
        email: row['Email'],
      }));

      const validGuests = guests.filter((guest) => guest.fullName && guest.email);

      resolve(validGuests);
    } catch (error) {
      reject(error);
    }
  });
};

