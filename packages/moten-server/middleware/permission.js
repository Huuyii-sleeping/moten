import { userDAO } from "../dao/user.js";
import { response } from "../utils/response.js";

export const permissionHandler = (roleId = 10) => {
  return async (req, res, next) => {
    const { id } = req.auth;
    if (!id) {
      return res.json(response.fail("missing id"));
    }
    const { status, message, result } = await userDAO.findOne(id);
    if (!status) res.json(response.fail(message));
    const [resultFirst] = result;
    if (resultFirst && resultFirst.role_id === roleId) {
      next();
    } else {
      res.json(response.accessDenied());
    }
  };
};
