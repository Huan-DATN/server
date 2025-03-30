/**
 * Updated by effiwork.com's author on Oct 18 2023
 * effiwork.com
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { StatusCodes } from "http-status-codes";
import envConfig from "../config";
import { StatusError } from "../utils/errors";

export const WHITELIST_DOMAINS = [
  "http://localhost:3000", // Không cần localhost nữa vì ở file config/cors đã luôn luôn cho phép môi trường dev (env.BUILD_MODE === 'dev')

  // Lưu ý: Đây là domain ví dụ sau khi Deploy Production (xem video 75 và video 76 để hiểu rõ kiến thức phần này, còn hiện tại mình đã xóa domain này rồi, đừng cố truy cập làm gì =))
  "https://app.tusgino.tech",
  "https://webapp-react-fm52q9zeo-tusginos-projects.vercel.app",
];

export const DOMAIN_MAIN = ["tusgino.tech", "vercel.app"];

// Cấu hình CORS Option trong dự án thực tế (Video số 62 trong chuỗi MERN Stack Pro)
export const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Nếu môi trường là local dev thì cho qua luôn
    // Hoặc môi trường là production thì cho qua luôn
    if (envConfig.NODE_ENV === "dev") {
      return callback(null, true);
    }

    // Ngược lại thì hiện tại code chúng ta đang làm còn 1 trường hợp là:
    // env.BUILD_MODE === 'production'

    // Kiểm tra xem origin có phải là domain được chấp nhận hay không
    if (
      WHITELIST_DOMAINS.includes(origin) ||
      DOMAIN_MAIN.some((domain) => (origin || "tusgino.tech").includes(domain))
    ) {
      return callback(null, true);
    }

    // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
    return callback(
      new StatusError({
        status: StatusCodes.FORBIDDEN,
        message: `${origin} not allowed by our CORS Policy.`,
      }),
    );
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  credentials: true,
};
