/**
 * @swagger
 * tags:
 *   name: Reading
 *   description: 感測數值
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     reading:
 *       type: object
 *       properties:
 *         device_id:
 *           type: integer
 *           description: 裝置ID
 *         sensor_id:
 *           type: integer
 *           description: 感測器ID
 *         value:
 *           type: number
 *           description: 數值
 *         timestamp:
 *           type: string
 *           format: date
 *           description: 時間
 */
const express = require("express");
const validateRequiredParams = require("../middlewares/validateRequiredParams");
const router = express.Router();
const { getReadings, addReadings, getReadingsByDevice } = require("../services/readingService");

/**
 * @swagger
 * /reading/get: # 路由路徑與 swagger 文件保持一致
 *   get:
 *     summary: 查詢記錄
 *     tags: [Reading]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *         description: 紀錄筆數
 *         required: true
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: # 回傳的是 reading 物件的陣列
 *                 $ref: '#/components/schemas/reading'
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/get", // 將路徑從 "/" 改為 "/get"
  validateRequiredParams({query: ["count"]}),
  async (req, res) => {
    const {count} = req.query;
    try {
      const readings = await getReadings(count);
      res.status(200).json(readings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

/**
 * @swagger
 * /reading/add:
 *   post:
 *     summary: 新增一筆或多筆紀錄
 *     tags: [Reading]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device_id:
 *                 type: integer
 *                 description: 裝置編號
 *                 example: 1
 *               values:
 *                 type: array
 *                 description: 感測數值陣列
 *                 items:
 *                   type: object
 *                   properties:
 *                     sensor_id:
 *                       type: integer
 *                       description: 感測器編號
 *                       example: 1
 *                     value:
 *                       type: number
 *                       description: 數值
 *                       example: 25.5
 *                   required:
 *                     - sensor_id
 *                     - value
 *             required:
 *               - device_id
 *               - values
 *     responses:
 *       200:
 *         description: 操作成功，回傳已新增的紀錄
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/reading'
 *       400:
 *         description: 請求格式錯誤
 *       500:
 *         description: Internal Server Error
 */

router.post(
  "/add",
  validateRequiredParams({body: ["device_id", "values"]}),
  async (req, res) => {
    try {
      const newReadings = await addReadings(req.body);
      res.status(200).json(newReadings);
    } catch (err) {
      console.error(err);
      // 如果 service 層有設定 statusCode (例如 400)，就使用它
      const statusCode = err.statusCode || 500;
      const message = err.statusCode ? err.message : "Internal Server Error";
      res.status(statusCode).json({ message });
    }
  }
)

/**
 * @swagger
 * /reading/by-device/{id}:
 *   get:
 *     summary: 依裝置 ID 取得分頁的感測數值
 *     tags: [Reading]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 裝置 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 頁碼 (預設 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每頁筆數 (預設 60)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 搜尋開始時間 (ISO 8601 格式)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 搜尋結束時間 (ISO 8601 格式)
 *       - in: query
 *         name: sensorId
 *         schema:
 *           type: integer
 *         description: 篩選特定感測器 ID
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/by-device/:id",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { page, limit, startDate, endDate, sensorId } = req.query;
      const result = await getReadingsByDevice({ deviceId: id, page, limit, startDate, endDate, sensorId });
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;
