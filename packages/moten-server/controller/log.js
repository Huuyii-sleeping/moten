import Joi from "joi";
import { response } from "../utils/response.js";
import validate from "../middleware/validate.js";
import { logDAO } from "../dao/log.js";

export class LogController {
  findAll() {
    const rules = Joi.object({
      url: Joi.string().required(),
      url_unique: Joi.string().optional(),
      page: Joi.number().min(1).optional(),
      size: Joi.number().min(1).optional(),
    });

    const handler = async (req, res) => {
      const { page, size, url, url_unique } = req.query;
      const { status, message, result } = await logDAO.findAll(
        page,
        size,
        url,
        url_unique
      );
      if (!status) return res.json(response.fail(message));
      return res.json(response.success(result));
    };
    return [validate(rules), handler];
  }
}
