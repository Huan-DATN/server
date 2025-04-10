import cloudinary from "cloudinary";
import streamifier from "streamifier";
import envConfig from "../config";
import { extractPublicId } from "../utils/helpers";

/**
 * Tài liệu tham khảo
 * https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud
 */

// Bước cấu hình cloudinary, sử dụng v2 - version 2
const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
});

// Khởi tạo một cái function để thực hiện upload file lên Cloudinary
const streamUpload = (
  fileBuffer: string | Buffer | Uint8Array,
  folderName?: string,
) => {
  return new Promise((resolve, reject) => {
    // Tạo một cái luồng stream upload lên cloudinary
    const stream = cloudinaryV2.uploader.upload_stream(
      { folder: folderName },
      (err, result) => {
        if (err) reject(err);
        else
          resolve({
            publicId: result?.public_id,
            url: result?.secure_url,
          });
      },
    );
    // Thực hiện upload cái luồng trên bằng lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const deleteMedia = (publicUrl: string) => {
  // Lấy publicId từ url
  const publicId = extractPublicId(publicUrl);

  return new Promise((resolve, reject) => {
    cloudinaryV2.uploader.destroy(publicId, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

export const CloudinaryProvider = { streamUpload, deleteMedia };
