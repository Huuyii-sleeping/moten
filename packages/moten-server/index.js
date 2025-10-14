import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { error404Handler, errorHandler } from "./middleware/error.js";
import {
  packageController,
  pageController,
  userController,
  logController,
  mediaController,
  pluginController,
  pluginUploadController,
} from "./controller/index.js";
import { expressjwt } from "express-jwt";
import { SECRET_KEY } from "./config/index.js";
import { authFailedHandler } from "./middleware/auth.js";
import { permissionHandler } from "./middleware/permission.js";
import { BasicCollabService } from "./services/collab/collab-basic-service.js";
import { exportRoute } from "./routes/export.js";
import performanceRouter from "./routes/performance.js";

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
  expressjwt({
    secret: SECRET_KEY,
    algorithms: ["HS256"],
  }).unless({
    path: [
      "/rest/v1/user/register",
      "/rest/v1/user/login",
      "/",
      "/api/export",
      "/api/performance/component",
    ],
  }),
  performanceRouter
);

server.listen(port, () => {
  console.log(`listening on port ${port}`);
  console.log(`Collaboration service avaliable at ws://localhost:${port}`);
});

app.post("/api/export", exportRoute(basiccollabService));

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

// 插件市场的相关路由
app.get("/rest/v1/plugin", pluginController.findAll());
app.get("/rest/v1/plugin/installed", pluginController.getInstalled());
app.post("/rest/v1/plugin/install", pluginController.install());
app.post("/rest/v1/plugin/upload", pluginUploadController.uploadPlugin());
app.post("/rest/v1/plugin/approve", pluginController.approvePlugin());
app.post("/rest/v1/plugin/reject", pluginController.rejectPlugin());
app.get("/rest/v1/plugin/:id", pluginController.findOne());

app.use(authFailedHandler);
app.use(errorHandler);
app.use(error404Handler);
