import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { corsOptions } from "./config/cors";
import { BaseController } from "./controllers/abstractions/base-controller";
import errorMiddleware from "./middlewares/error.middleware";
class App {
  public app: express.Application;
  public port: number | string;

  constructor(controllers: BaseController[], port: number | string) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeCORS();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use((req, res, next) => {
      res.set("Cache-Control", "no-store");
      next();
    });
    this.app.use(express.json());
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    // Serve static files from the public directory
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeCORS() {
    this.app.use((req, res, next) => {
      cors(corsOptions)(req, res, next);
    });
  }

  private initializeControllers(controllers: BaseController[]) {
    this.app.get("/", (request, response) => {
      response.send("Application is running");
    });
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  public listen() {
    this.app.listen(
      {
        port: this.port,
        host: "localhost",
      },
      () => {
        console.log(`App listening on the port ${this.port}`);
      },
    );
  }
}

export default App;
