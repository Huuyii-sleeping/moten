import Joi from "joi";
import { response } from "../utils/response.js";
import { userDAO } from "../dao/user.js";
import validate from "../middleware/validate.js";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/index.js";

export class UserController {
  register() {
    const rules = Joi.object({
      username: Joi.string().min(6).max(20).required(),
      password: Joi.string().min(8).max(32).required(),
    });
    const handler = async (req, res) => {
      const { status, message, result } = await userDAO.register(req.body);
      if (!status) return res.json(response.fail(message));
      return res.json(response.success(result));
    };
    return [validate(rules, "body"), handler];
  }

  login() {
    const rules = Joi.object({
      username: Joi.string().min(6).max(20).required(),
      password: Joi.string().min(8).max(32).required(),
    });
    const handler = async (req, res) => {
      const { status, message, result } = await userDAO.login(req.body);
      if (!status) return res.json(response.fail(message));
      const [resultFirst] = result;
      if (resultFirst) {
        const token = jwt.sign({ id: resultFirst.user_id }, SECRET_KEY, {
          expiresIn: "24h",
        });
        return res.json(response.success({ ...resultFirst, token }));
      } else res.json(response.authorizeFailed());
    };
    return [validate(rules, "body"), handler];
  }
}
