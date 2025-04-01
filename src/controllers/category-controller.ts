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
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const categories = await this.prisma.productCategory.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });
      return res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };
  //#endregion
}
