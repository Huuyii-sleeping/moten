const SUCCESS = { code: 200, message: "success" };

const FAILED = { code: 500, message: "fail" };

const VALIDATOR_FAILED = { code: 400, message: "params validated failed" };

const API_NOT_FOUNT = { code: 404, message: "api does not exist" };

class Response {
  code;
  message;
  data;

  /**
   *
   * @param {number} code
   * @param {string} message
   * @param {any} data
   */
  constructor(code, message, data) {
    this.code = code;
    this.message = message || "";
    this.data = data || null;
  }

  // 接口返回值的类型 进行定义
  static success(data) {
    return new Response(SUCCESS.code, SUCCESS.message, data);
  }

  static fail(message = "") {
    return new Response(FAILED.code, FAILED.message + message);
  }

  static validatorFailed(keys) {
    return new Response(
      VALIDATOR_FAILED.code,
      VALIDATOR_FAILED.message + `${keys ? ":" + keys : ""}`
    );
  }

  static apiNotFount() {
    return new Response(API_NOT_FOUNT.code, API_NOT_FOUNT.message);
  }
}

export const response = Response;
