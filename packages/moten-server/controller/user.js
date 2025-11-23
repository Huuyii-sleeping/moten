import Joi from "joi";
import { response } from "../utils/response.js";
import { userDAO } from "../dao/user.js";
import validate from "../middleware/validate.js";
import jwt from "jsonwebtoken";

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
        if (resultFirst.disable) {
          res.json(response.accessDenied());
          return;
        }
        const token = jwt.sign(
          { id: resultFirst.user_id },
          process.env.SECRET_KEY,
          {
            expiresIn: "15m",
          }
        );
        const refreshToken = jwt.sign(
          { id: resultFirst.user_id, type: "refresh" },
          process.env.SECRET_KEY,
          {
            expiresIn: "7d",
          }
        );
        return res.json(
          response.success({ ...resultFirst, token, refreshToken })
        );
      } else res.json(response.authorizeFailed());
    };
    return [validate(rules, "body"), handler];
  }

  refresh() {
    const rules = Joi.object({
      refreshToken: Joi.string().required(),
    });

    const handler = async (req, res) => {
      const { refreshToken } = req.body;
      try {
        const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
        const newToken = jwt.sign({ id: decoded.id }, process.env.SECRET_KEY, {
          expiresIn: "15m",
        });
        return res.json(
          response.success({
            token: newToken,
          })
        );
      } catch (error) {
        return res.json(response.authorizeFailed());
      }
    };
    return [validate(rules, "body"), handler];
  }

  findAll() {
    const rules = Joi.object({
      page: Joi.number().min(1).optional(),
      size: Joi.number().min(1).optional(),
    });

    const handler = async (req, res) => {
      const { page, size } = req.query;
      const { status, message, result } = await userDAO.findAll(page, size);
      if (!status) return res.json(response.fail(message));
      return res.json(response.success(result));
    };
    return [validate(rules), handler];
  }

  disable() {
    const rules = Joi.object({
      id: Joi.string().min(1).max(10).required(),
      disable: Joi.number().min(0).max(1).required(),
    });
    const handler = async (req, res) => {
      const { id, disable } = req.body;
      const { status, message, result } = await userDAO.disable(id, disable);
      if (!status) return res.json(response.fail(message));
      return res.json(response.success(result));
    };
    return [validate(rules, "body"), handler];
  }
}
