import dotenv from "dotenv";
import App from "./app";
import HeroController from "./controllers/hero-controller";
import MediaController from "./controllers/media-controller";

dotenv.config();

const port = process.env.PORT || 3000;
const app = new App([new HeroController(), new MediaController()], port);

app.listen();
