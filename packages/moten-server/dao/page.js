import { query } from "../common/mysql.js";
import { daoErrorHandler } from "../utils/dao-error.js";

class PageDAO {
  async findAll(page = 1, size = 10) {
    const sql = `SELECT * FROM page ORDER BY page_id DESC LIMIT ?,?`;
    const params = [(page - 1) * size, size].map(String);
    const res =  await daoErrorHandler(() => query(sql, params));
    return res
  }
  findOne() {}
  create() {}
  update() {}
  remove() {}
}

export const pageDAO = new PageDAO()
