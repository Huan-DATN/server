import dotenv from "dotenv";
import App from "./app";
import AuthController from "./controllers/auth-controller";
import CarouselController from "./controllers/carousel-controller";
import CartController from "./controllers/cart-controller";
import ProductCategoryController from "./controllers/category-controller";
import ChatController from "./controllers/chat-controller";
import CommonController from "./controllers/common-controller";
import MediaController from "./controllers/media-controller";
import OrderController from "./controllers/order-controller";
import ProductController from "./controllers/product-controller";
import RatingController from "./controllers/rating-controller";
import StatisticController from "./controllers/statistic-controller";
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
    new OrderController(),
    new CommonController(),
    new RatingController(),
    new StatisticController(),
    new ChatController(),
    new CarouselController(),
  ],
  port,
);

app.listen();
