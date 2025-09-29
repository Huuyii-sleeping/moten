import { logDAO } from "../dao/index.js";

export const oprateLogHandler = async (req, res, next) => {
  const obj = {
    user_id: req.auth.id,
    url: req.route.path,
    url_unique: req.body.id,
    body: JSON.stringify(req.body),
  };

  await logDAO.create(obj)
};
