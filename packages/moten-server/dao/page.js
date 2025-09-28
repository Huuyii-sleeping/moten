import { query } from "../common/mysql.js";
import { daoErrorHandler } from "../utils/dao-error.js";

class PageDAO {
  async findAll(page = 1, size = 10, id) {
    const sql = id
      ? `SELECT * FROM page WHERE page_id < ? ORDER BY page_id DESC LIMIT ?`
      : `SELECT * FROM page ORDER BY page_id DESC LIMIT ?,?`;
    // 游标分页，当你突然将某个数据删除，为了保证数据的准确性就可以使用这个方法 找到<多少的数据
    // const othersql = ;
    const params = (id ? [id, size] : [(page - 1) * size, size]).map(String);
    const res = await daoErrorHandler(() => query(sql, params));
    return res;
  }
  findOne() {}
  create() {}
  update() {}
  remove() {}
}

export const pageDAO = new PageDAO();
