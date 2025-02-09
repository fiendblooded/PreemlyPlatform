export const extractPublicId = (url: string): string => {
  try {
    const parts = url.split('/');
    return parts[parts.length - 2];
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return '';
  }
};
    