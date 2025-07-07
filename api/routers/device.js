/**
 * @swagger
 * tags:
 *   name: Device
 *   description: 裝置
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     device:
 *       type: object
 *       properties:
 *         device_id:
 *           type: integer
 *           description: 裝置ID
 *         device_name:
 *           type: string
 *           description: 裝置名稱
 *         location:
 *           type: integer
 *           description: 位置ID
 */


const express = require("express");
const router = express.Router();
const db = require("../db");


/**
 * @swagger
 * /device/getList:
 *   get:
 *     summary: 取得裝置列表
 *     tags: [Device]
 *     parameters:
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/device'
 *       500:
 *         description: Internal Server Error
 */

router.get(
  "/getList",
  async (req, res) => {
    // res.status(200).json({ 'data': 'hi' });
    let conn;
    try {
      
      // 取得資料
      conn = await db.getConnection();
      const query = `SELECT * FROM devices`;
      const rows = await conn.query(query);

      // 回傳結果
      res.status(200).send(rows);
    } catch (err) {
      res.status(500).send(err);
      // throw err;
    } finally {
      if (conn) return conn.release();
    }
  }
)

module.exports = router;
