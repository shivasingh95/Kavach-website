import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath: string, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `kavach/${folder}`,
      use_filename: true,
      unique_filename: true,
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};
