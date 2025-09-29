import dayjs from "dayjs";
import { query } from "../common/mysql.js";
import { daoErrorHandler } from "../utils/dao-error.js";

export class LogDAO {
  async create(obj) {
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    const realKeys = [...keys, "create_time"];
    const sqlKeys = realKeys.join(",");
    const sqlValues = realKeys.map((v) => "?").join(",");
    const sql = `INSERT INTO log (${sqlKeys}) VALUES (${sqlValues})`;
    const time = dayjs().format();
    const parmas = [...values, time].map(String);
    const result = await daoErrorHandler(() => query(sql, parmas));
    return result;
  }

  async findAll(page = 1, size = 10, url, url_unique) {
    const sql = `SELECT * FROM log WHERE url = ? AND url_unique = ? ORDER BY create_time DESC LIMIT ?,?`;
    const params = [url, url_unique, (page - 1) * size, size].map(String);
    const result = await daoErrorHandler(() => query(sql, params));
    return result;
  }
}

export const logDAO = new LogDAO();
