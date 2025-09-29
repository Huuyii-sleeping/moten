import { query } from "../common/mysql.js";
import { daoErrorHandler } from "../utils/dao-error.js";
import dayjs from "dayjs";

class PackageDAO {
  async findAll(page = 1, size = 10, id) {
    const sql = id
      ? `SELECT * FROM package WHERE package_id < ? ORDER BY package_id DESC LIMIT ?`
      : `SELECT * FROM package ORDER BY package_id DESC LIMIT ?,?`;
    const params = (id ? [id, size] : [(page - 1) * size, size]).map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }
  async findOne(id) {
    const sql = `SELECT * FROM package WHERE package_id = ? LIMIT 1`;
    const params = [id].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }
  async create(body) {
    const keys = Object.keys(body);
    const values = Object.values(body);
    const realKeys = [...keys, "create_time", "update_time"];
    const sqlKeys = realKeys.join(",");
    const sqlValues = realKeys.map((v) => "?").join(",");
    const sql = `INSERT INTO package (${sqlKeys}) VALUES (${sqlValues})`;
    const time = dayjs().format();
    const params = [...values, time, time].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }
  async update(body, id) {
    const keys = Object.keys(body);
    const values = Object.values(body);
    const realKeys = [...keys, "update_time"];
    const sqlKeys = realKeys.map((v) => `${v} = ?`).join(",");
    const sql = `UPDATE package SET ${sqlKeys} WHERE package_id = ? LIMIT 1`;
    const time = dayjs().format();
    const params = [...values, time, id].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }
  async remove(id) {
    const sql = `DELETE FROM package WHERE package_id = ? LIMIT 1`;
    const params = [id].map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }
}

export const packageDAO = new PackageDAO();
