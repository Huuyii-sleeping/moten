import express from "express";
import cors from "cors";
import { error404Handler, errorHandler } from "./middleware/error.js";
import {
  packageController,
  pageController,
  userController,
  logController,
  mediaController,
} from "./controller/index.js";
import { expressjwt } from "express-jwt";
import { SECRET_KEY } from "./config/index.js";
import { authFailedHandler } from "./middleware/auth.js";
import { permissionHandler } from "./middleware/permission.js";
import path from "path";
import { createServer } from "http";
import { BasicCollabService } from "./services/collab/collab-basic-service.js";

const app = express();
app.use(cors());
const server = createServer(app);
const port = 8081;

const basiccollabService = new BasicCollabService();
basiccollabService.init(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(
  // JWT的设置
  expressjwt({
    secret: SECRET_KEY,
    algorithms: ["HS256"],
  }).unless({ path: ["/rest/v1/user/register", "/rest/v1/user/login", "/"] })
);

server.listen(port, () => {
  console.log(`listening on port ${port}`);
  console.log(`Collaboration service avaliable at ws://localhost:${port}`);
});

// user
app.post("/rest/v1/user/register", userController.register());
app.post("/rest/v1/user/login", userController.login());
app.get("/rest/v1/user", userController.findAll());
app.post("/rest/v1/user/disabled", userController.disable());

// 页面
app.get("/rest/v1/page", pageController.findAll());
app.get("/rest/v1/page/:id", pageController.findOne());
app.post("/rest/v1/page/create", pageController.create());
app.post(
  "/rest/v1/page/delete",
  [permissionHandler(20)],
  pageController.remove()
);
app.post("/rest/v1/page/update", pageController.update());

// 套件
app.get("/rest/v1/package", packageController.findAll());
app.get("/rest/v1/package/:id", packageController.findOne());
app.post("/rest/v1/package/create", packageController.create());
app.post(
  "/rest/v1/package/delete",
  [permissionHandler(20)],
  packageController.remove()
);
app.post("/rest/v1/package/update", packageController.update());

// 日志
app.get("/rest/v1/log", logController.findAll());

// 媒体上传
app.post("/rest/v1/media/upload", mediaController.upload());

app.use(authFailedHandler);
app.use(errorHandler);
app.use(error404Handler);
