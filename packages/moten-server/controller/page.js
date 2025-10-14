import Joi from "joi";
import { response } from "../utils/response.js";
import { pageDAO } from "../dao/page.js";
import validate from "../middleware/validate.js";
import { omit } from "lodash-es";
import { oprateLogHandler } from "../middleware/opratelog.js";

export class PageController {
  findAll() {
    const rules = Joi.object({
      id: Joi.number().optional(),
      page: Joi.number().min(1).optional(),
      size: Joi.number().min(1).optional(),
    });

    const handler = async (req, res) => {
      const { page, size, id } = req.query;
      const { status, message, result } = await pageDAO.findAll(page, size, id);

      if (!status) return res.json(response.fail(message));
      return res.json(response.success(result));
    };
    return [validate(rules), handler];
  }
  findOne() {
    const rules = Joi.object({
      id: Joi.number().optional(),
    });

    const handler = async (req, res) => {
      const { id } = req.params;
      const { status, message, result } = await pageDAO.findOne(id);
      if (!status) return res.json(response.fail(message));
      return res.json(response.success(result));
    };
    return [validate(rules), handler];
  }
  create() {
    const rules = Joi.object({
      name: Joi.string().optional(),
      content: Joi.string().optional(),
      description: Joi.string().optional(),
      coverImage: Joi.string().optional(),
    });
    const handler = async (req, res) => {
      const { status, message, result } = await pageDAO.create(req.body);
      if (!status) return res.json(response.fail(message));
      return res.json(response.success(result));
    };
    return [validate(rules, "body"), handler];
  }
  update() {
    const rules = Joi.object({
      id: Joi.number().required(),
      name: Joi.string().optional(),
      content: Joi.string().optional(),
      description: Joi.string().optional(),
      coverImage: Joi.string().optional(),
    });
    const handler = async (req, res, next) => {
      const pickBody = omit(req.body, ["id"]);
      const { id } = req.body;
      const { status, message, result } = await pageDAO.update(pickBody, id);
      if (!status) return res.json(response.fail(message));
      res.json(response.success(result));
      next();
    };
    return [validate(rules, "body"), handler, oprateLogHandler];
  }
  remove() {
    const rules = Joi.object({
      id: Joi.number().optional(),
    });
    const handler = async (req, res) => {
      const { id } = req.body;
      const { status, message, result } = await pageDAO.remove(id);
      if (!status) return res.json(response.fail(message));
      return res.json(response.success(result));
    };
    return [validate(rules, "body"), handler];
  }
}
