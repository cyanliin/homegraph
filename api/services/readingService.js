const db = require("../db");

/**
 * 依筆數取得最新的感測數值
 * @param {number | string} count 欲取得的筆數
 * @returns {Promise<Array>} 數值列表
 */
const getReadings = async (count) => {
  let conn;
  try {
    conn = await db.getConnection();
    // 使用 ? 作為參數佔位符以防止 SQL 注入
    const query = `SELECT * FROM readings ORDER BY timestamp DESC LIMIT ?`;
    // 確保 count 是整數
    const rows = await conn.query(query, [parseInt(count, 10)]);
    return rows;
  } finally {
    if (conn) conn.release();
  }
};

/**
 * 新增多筆感測數值
 * @param {object} readingData - 包含 device_id 和一個 values 陣列 {sensor_id, value} 的物件
 * @returns {Promise<Array>} 新增的數值資料列表
 */
const addReadings = async (readingData) => {
  const { device_id, values } = readingData;

  // 基本的輸入驗證
  if (!device_id || !Array.isArray(values) || values.length === 0) {
    const error = new Error("無效的輸入：必須提供 'device_id' 以及一個非空的 'values' 陣列。");
    error.statusCode = 400; // Bad Request
    throw error;
  }

  let conn;
  try {
    conn = await db.getConnection();
    // 使用交易確保資料一致性
    await conn.beginTransaction();

    // 準備批次插入的資料，格式為 [[device_id, sensor_id, value], ...]
    const rowsToInsert = values.map(v => {
      if (v.sensor_id === undefined || v.value === undefined) {
        // 這屬於客戶端請求格式錯誤，應回傳 400
        const error = new Error("'values' 陣列中的每個項目都必須包含 'sensor_id' 和 'value'。");
        error.statusCode = 400;
        throw error;
      }
      return [device_id, v.sensor_id, v.value];
    });

    // 使用 conn.batch() 進行批次插入，這是 node-mariadb 處理此類操作的推薦方法
    // SQL 語句需要為單筆插入的格式
    const insertQuery = `INSERT INTO readings(device_id, sensor_id, value) VALUES (?, ?, ?)`;
    await conn.batch(insertQuery, rowsToInsert);

    // conn.batch 的回傳結果不包含可靠的 insertId，我們需要用 SQL 函數來取得
    // LAST_INSERT_ID() 會回傳批次插入的第一個 ID
    // ROW_COUNT() 會回傳上一條語句影響的行數 (即插入的筆數)
    const [{ firstId, count }] = await conn.query(
      "SELECT LAST_INSERT_ID() as firstId, ROW_COUNT() as count"
    );

    const firstInsertId = Number(firstId);
    const affectedRows = Number(count);

    if (affectedRows === 0) {
      await conn.commit();
      return []; // 如果沒有任何資料被插入，直接回傳空陣列
    }

    // 查詢並回傳所有剛插入的資料
    const lastInsertId = firstInsertId + affectedRows - 1;
    const selectQuery = 'SELECT * FROM readings WHERE reading_id >= ? AND reading_id <= ?';
    const insertedRows = await conn.query(selectQuery, [firstInsertId, lastInsertId]);

    await conn.commit();
    return insertedRows;
  } catch (err) {
    if (conn) await conn.rollback(); // 如果出錯，回復交易
    throw err; // 將錯誤傳遞給路由層處理
  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getReadings,
  addReadings,
};