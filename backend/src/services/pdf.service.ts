import axios from 'axios';
import pdfParse from 'pdf-parse';

export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    // Download the PDF file
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
    });

    // Parse the PDF
    const pdfData = await pdfParse(response.data);

    // Return the text content
    return pdfData.text;
  } catch (error: unknown) {
    console.error('Error extracting text from PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
};
