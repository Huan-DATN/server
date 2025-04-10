import express from "express";
import { multerUploadMiddleware } from "../libs/multer";
import { CloudinaryProvider } from "../provider/cloudinaryProvider";
import { BaseController } from "./abstractions/base-controller";
export default class MediaController extends BaseController {
  public path = "/media";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Bạn có thể thêm put, patch, delete sau.
    this.router.post(
      `${this.path}/upload`,
      multerUploadMiddleware.upload.single("image") as any,
      this.uploadMedia,
    );
    this.router.delete(
      `${this.path}/delete`,
      multerUploadMiddleware.upload.single("image") as any,
      this.deleteMedia,
    );
  }

  uploadMedia = async (
    request: express.Request,
    response: express.Response,
  ) => {
    const file = request.file;

    if (!file) {
      throw new Error("File is not found");
    }

    console.log(file);
    const uploadResult = await CloudinaryProvider.streamUpload(
      file.buffer,
      "test",
    );
    return response.json({
      message: "Upload successfully",
      data: uploadResult,
    });
  };

  deleteMedia = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const { publicUrl } = request.body;

      if (!publicUrl) {
        throw new Error("publicUrl is not found");
      }

      const deleteResult = await CloudinaryProvider.deleteMedia(publicUrl);
      return response.json({
        message: "Delete successfully",
        data: deleteResult,
      });
    } catch (error) {
      next(error);
    }
  };
}
