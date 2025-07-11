const db = require("../db");

/**
 * 取得所有感測器類型
 * @returns {Promise<Array>} 感測器列表
 */
const getAllSensors = async () => {
  let conn;
  try {
    conn = await db.getConnection();
    const query = `SELECT * FROM sensors`;
    const rows = await conn.query(query);
    return rows;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getAllSensors,
};