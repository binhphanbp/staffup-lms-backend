import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env.config';
import { AppError } from '@/utils';

let isConfigured = false;

export const getCloudinaryClient = () => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      500,
    );
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    isConfigured = true;
  }

  return cloudinary;
};
