import mysql from "mysql2";
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionLimit: 1000,
  queueLimit: 0,
  waitForConnections: true,
  charset: "UTF8MB4_GENERAL_CI",
});

export const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    // 获取链接操作 因为连接是异步获取的，所以必须在回调当中进行操作connection
    pool.getConnection((err, connection) => {
      if (err instanceof Error) {
        reject(err);
        return;
      }
      // 执行SQL
      // 执行SQL 使用？+params数组的形式更加安全，放置mySQL注入
      connection.execute(sql, params, function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        // 释放连接 ！！
        pool.releaseConnection(connection);
      });
    });
  });
};
