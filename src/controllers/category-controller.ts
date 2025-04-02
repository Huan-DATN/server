import express from "express";
import { BaseController } from "./abstractions/base-controller";

export default class ProductCategoryController extends BaseController {
  public path = "/category";

  constructor() {
    super();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Bạn có thể thêm put, patch, delete sau.
    this.router.get(`${this.path}`, this.getAll);
  }

  //#region FetchAll
  getAll = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const categories = await this.prisma.category.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return response.send({
        message: "Đăng ký thành công",
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };
  //#endregion
}
