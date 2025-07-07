/**
 * @swagger
 * /deviceReading/add:
 *   post:
 *     summary: 新增一個筆紀錄
 *     tags: [DeviceReading]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               properties:
 *                 device_id:
 *                   type: integer
 *                   description: 裝置編號 
 *                 sensor_id:
 *                   type: integer
 *                   description: 感測器編號
 *                 value:
 *                   type: number
 *                   description: 數值
 *               required:
 *                 - device_id
 *                 - sensor_id
 *                 - value
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/deviceReading'
 *       500:
 *         description: Internal Server Error
 */


const express = require("express");
const validateRequiredParams = require("../../middlewares/validateRequiredParams");
const db = require("../../db");

const router = express.Router();
router.post(
  "/",
  validateRequiredParams({body: ["device_id", "sensor_id", "value"]}),
  async (req, res) => {

    const { device_id, sensor_id, value } = req.body;

    let conn;
    try {
      
      // 執行新增操作
      conn = await db.getConnection();
      const query = `INSERT INTO readings(device_id, sensor_id, value) VALUES(?,?,?)`;
      const result = await conn.query(query, [device_id, sensor_id, value]);
      conn.release();
  
      // 根據剛插入的 ID 查詢該筆資料
      const insertedId = result.insertId;
      const insertedData = await conn.query('SELECT * FROM readings WHERE reading_id = ?', [insertedId]);
  
      // 回傳新增的資料
      res.status(200).json(insertedData[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    } finally {
      if (conn) conn.release();
    }
  }
)

module.exports = router;