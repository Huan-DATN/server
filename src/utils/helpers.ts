import crypto from "crypto";
import fs from "fs";
import { NotFoundError } from "./errors";

export const randomId = () => crypto.randomUUID().replace(/-/g, "");
export const createFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const extractPublicId = (url: string) => {
  const pattern = /\/upload\/.+?\/(.+?)\./;
  const match = url.match(pattern);

  if (!match) {
    throw new NotFoundError("Public Id format");
  }

  return match[1];
};
