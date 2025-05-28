import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const configSchema = z.object({
  DOMAIN: z.string().default("localhost"),
  PROTOCOL: z.string().default("http"),
  UPLOAD_FOLDER: z.string().default("uploads"),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["dev", "production"]).default("dev"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("postgres"),
  DB_NAME: z.string().default("postgres"),
  DB_URL: z.string().default(""),
  SESSION_TOKEN_EXPIRES_IN: z.string().default("1d"),
  SESSION_TOKEN_SECRET: z.string().default("secret"),
  CLOUDINARY_CLOUD_NAME: z.string().default(""),
  CLOUDINARY_API_KEY: z.string().default(""),
  CLOUDINARY_API_SECRET: z.string().default(""),
  CLOUDINARY_BASE_URL: z.string().default(""),
  IS_PRODUCTION: z.coerce.boolean().default(false),
  PRODUCTION_URL: z.string().default(""),
  CHATBOT_URL: z.string().default("http://localhost:5000"),
  RECOMMENDATION_URL: z.string().default("http://localhost:6000"),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error(configServer.error.issues);
  throw new Error("Các giá trị khai báo trong file .env không hợp lệ");
}
const envConfig = configServer.data;
export const API_URL = envConfig.IS_PRODUCTION
  ? envConfig.PRODUCTION_URL
  : `${envConfig.PROTOCOL}://${envConfig.DOMAIN}:${envConfig.PORT}`;
export default envConfig;
