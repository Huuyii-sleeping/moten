import { query } from "../common/mysql.js";
import { daoErrorHandler } from "../utils/dao-error.js";
import dayjs from "dayjs";
import { customAlphabet } from "nanoid";

class UserDAO {
  async register(body) {
    const { username, password } = body;
    const realKeys = ["user_id", "user_name", "password","role_id", "create_time"];
    const sqlKeys = realKeys.join(",");
    const sqlValues = realKeys.map((v) => "?").join(",");
    const sql = `INSERT INTO user (${sqlKeys}) VALUES (${sqlValues})`;
    const time = dayjs().format();
    const id = customAlphabet("123456789qwertyuiopasdfghjklzxcvbnm", 10)();
    const params = [id, username, password, 10, time].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }
  async login(body) {
    const { username, password } = body;
    const sql =
      "SELECT user_id,user_name,create_time,disable,role_id FROM user WHERE user_name = ? AND password = ? LIMIT 1";
    const params = [username, password].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }

  async findAll(page = 1, size = 10) {
    const sql = `SELECT u.user_id,u.user_name,u.create_time,u.disable,r.role FROM user AS u JOIN role as r ON u.role_id = r.role_id LIMIT ?,?`;
    const params = [(page - 1) * size, size].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }

  async disable(id, disable = 1) {
    const sql = `UPDATE user SET disable = ? WHERE user_id = ? LIMIT 1`;
    const params = [disable, id].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }

  async findOne(id) {
    const sql = `SELECT user_id,user_name,create_time,disable,role_id FROM user WHERE user_id = ? LIMIT 1`;
    const params = [id].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }
}

export const userDAO = new UserDAO();
