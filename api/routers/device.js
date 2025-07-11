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
const deviceService = require("../services/deviceService");


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
    try {
      const devices = await deviceService.getAllDevices();
      res.status(200).json(devices);
    } catch (err) {
      // 紀錄詳細錯誤，但只回傳通用的錯誤訊息
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
)

/**
 * @swagger
 * /device/{id}:
 *   get:
 *     summary: 取得單一裝置資訊
 *     tags: [Device]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 裝置 ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/device'
 *       404:
 *         description: Device not found
 *       500:
 *         description: Internal Server Error
 */
router.get(
  "/:id",
  async (req, res) => {
    try {
      const device = await deviceService.getDeviceById(req.params.id);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.status(200).json(device);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;
