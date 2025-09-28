import { response } from "../utils/response.js";

export const error404Handler = (req, res, next) => {
  res.json(response.apiNotFount());
};

export const errorHandler = (err, req, res, next) => {
  const msg = err.message;
  res.json(response.fail(msg));
};
