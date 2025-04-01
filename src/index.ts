import dotenv from "dotenv";
import App from "./app";
import AuthController from "./controllers/auth-controller";
import ProductCategoryController from "./controllers/category-controller";
import MediaController from "./controllers/media-controller";

dotenv.config();

const port = process.env.PORT || 3000;
const app = new App(
  [
    new MediaController(),
    new AuthController(),
    new ProductCategoryController(),
  ],
  port,
);

app.listen();
