const db = require("../db");

/**
 * 取得所有裝置
 * @returns {Promise<Array>} 裝置列表
 */
const getAllDevices = async () => {
  let conn;
  try {
    conn = await db.getConnection();
    const query = `SELECT * FROM devices`;
    const rows = await conn.query(query);
    return rows;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getAllDevices,
};