import express from "express";
import cors from "cors";
import { error404Handler, errorHandler } from "./middleware/error.js";
import { pageController, userController } from "./controller/index.js";
import { expressjwt } from "express-jwt";
import { SECRET_KEY } from "./config/index.js";
import { authFailedHandler } from "./middleware/auth.js";

const app = express();
const port = 8081;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  // JWT的设置
  expressjwt({
    secret: SECRET_KEY,
    algorithms: ["HS256"],
  }).unless({ path: ["/rest/v1/user/register", "/rest/v1/user/login"] })
);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

app.post("/rest/v1/user/register", userController.register());
app.post("/rest/v1/user/login", userController.login());

// 分页查询
app.get("/rest/v1/page", pageController.findAll());
app.get("/rest/v1/page/:id", pageController.findOne());
app.post("/rest/v1/page/create", pageController.create());
app.post("/rest/v1/page/delete", pageController.remove());
app.post("/rest/v1/page/update", pageController.update());

app.use(authFailedHandler);
app.use(errorHandler);
app.use(error404Handler);
