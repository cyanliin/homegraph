/**
 * @swagger
 * tags:
 *   name: Sensor
 *   description: 感測器類型
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     sensor:
 *       type: object
 *       properties:
 *         sensor_id:
 *           type: integer
 *           description: 感測器ID
 *         sensor_name:
 *           type: string
 *           description: 感測器名稱
 */

const express = require("express");
const router = express.Router();
const sensorService = require("../services/sensorService");

/**
 * @swagger
 * /sensor/getList:
 *   get:
 *     summary: 取得所有感測器類型
 *     tags: [Sensor]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get("/getList", async (req, res) => {
  try {
    const sensors = await sensorService.getAllSensors();
    res.status(200).json(sensors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;