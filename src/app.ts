import bodyParser from "body-parser";
import express from "express";
import { BaseController } from "./controllers/abstractions/base-controller";
import errorMiddleware from "./middlewares/error.middleware";

class App {
  public app: express.Application;
  public port: number | string;

  constructor(controllers: BaseController[], port: number | string) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
    this.initializeMore();
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeMore() {
    this.app.use(bodyParser.json());
    // this.app.use(cors());
    this.app.use((req, res, next) => {
      res.set("Cache-Control", "no-store");
      next();
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
