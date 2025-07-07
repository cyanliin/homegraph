/**
 * @swagger
 * /envMonitor/queryRecord:
 *   get:
 *     summary: 查詢記錄
 *     tags: [EnvMonitor]
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *         description: 時間範圍起點
 *         required: true
 *       - in: query
 *         name: end
 *         schema:
 *           type: integer
 *         description: 時間範圍結束
 *         required: true
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: integer
 *         description: 資料整合方式:hour|day
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/envRecord'
 *       500:
 *         description: Internal Server Error
 */

const express = require("express");
const validateRequiredParams = require("../../middlewares/validateRequiredParams");
const db = require("../../db");

const router = express.Router();

router.get(
  "/",
  validateRequiredParams({query: ["start", "end"]}),
  async (req, res) => {
    
    const {start, end, groupBy} = req.query;

    let conn;
    try {
      
      // 取得資料
      conn = await db.getConnection();
      const query = `SELECT * FROM envRecord WHERE enter_time >= ? AND enter_time <= ?`;
      const rows = await conn.query(query, [start, end]);

      // 回傳結果
      res.status(200).send(rows);
    } catch (err) {
      res.status(500).send(err);
      // throw err;
    } finally {
      if (conn) return conn.release();
    }
  }
);

module.exports = router;