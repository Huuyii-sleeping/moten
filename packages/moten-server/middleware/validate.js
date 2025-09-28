import { response } from "../utils/response.js";

export default (rules, key = "query") => {
  return (req, res, next) => {
    const { error } = rules.validate(req[key]);
    if (error) {
      const err = error.details[0].message;
      return res.json(response.validatorFailed(err));
    }
    next();
  };
};
