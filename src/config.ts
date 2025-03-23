import dotenv from "dotenv";

dotenv.config();

const Config = {
  port: process.env.PORT || 3000,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

export default Config;
