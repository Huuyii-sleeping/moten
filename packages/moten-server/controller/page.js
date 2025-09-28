import Joi from "joi";
import { response } from "../utils/response.js";
import { pageDAO } from "../dao/page.js";
import validate from "../middleware/validate.js";

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
  create() {}
  update() {}
  remove() {}
}
