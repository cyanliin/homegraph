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

/**
 * 依 ID 取得單一裝置
 * @param {number | string} id 裝置 ID
 * @returns {Promise<object|null>} 裝置物件或 null
 */
const getDeviceById = async (id) => {
  let conn;
  try {
    conn = await db.getConnection();
    const query = `SELECT * FROM devices WHERE device_id = ?`;
    const [device] = await conn.query(query, [id]);
    return device || null;
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getAllDevices,
  getDeviceById,
};