import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath: string, folder = 'default') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

export const uploadRawFile = async (filePath: string, folder = 'default', publicId?: string) => {
  try {
    const options = {
      resource_type: 'raw' as const,
      folder,
      use_filename: false,
      unique_filename: true,
      public_id: publicId,
    };

    const result = await cloudinary.uploader.upload(filePath, options);
    return result;
  } catch (error) {
    console.error('Error uploading raw file to Cloudinary:', error);
    throw new Error('Failed to upload file');
  }
};

export default cloudinary;
