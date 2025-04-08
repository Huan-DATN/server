import dotenv from "dotenv";
import App from "./app";
import AuthController from "./controllers/auth-controller";
import CartController from "./controllers/cart-controller";
import ProductCategoryController from "./controllers/category-controller";
import MediaController from "./controllers/media-controller";
import ProductController from "./controllers/product-controller";
import UserController from "./controllers/user-controller";

dotenv.config();

const port = process.env.PORT || 3000;
const app = new App(
  [
    new MediaController(),
    new AuthController(),
    new ProductCategoryController(),
    new UserController(),
    new ProductController(),
    new CartController(),
  ],
  port,
);

app.listen();
