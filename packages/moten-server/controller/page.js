import Joi from "joi";
import { response } from "../utils/response.js";
import { pageDAO } from "../dao/page.js";

export class PageController {
  findAll() {
    // 验证参数 查询数据
    const rules = Joi.object({
      page: Joi.number().min(1).optional(),
      size: Joi.number().min(1).optional(),
    });
    return [
      (req, res, next) => {
        const { error } = rules.validate(req.query);
        if (error) {
          const err = error.details[0].message;
          return res.json(response.validatorFailed(err));
        }
        next();
      },
      async (req, res) => {
        const { page, size } = req.query;
        const { status, message, result } = await pageDAO.findAll(page, size);
        if (!status) return res.json(response.fail(message));
        return res.json(response.success(result));
      },
    ];
  }
  findOne() {}
  create() {}
  update() {}
  remove() {}
}
