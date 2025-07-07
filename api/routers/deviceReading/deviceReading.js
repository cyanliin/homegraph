/**
 * @swagger
 * tags:
 *   name: DeviceReading
 *   description: 裝置數值
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     deviceReading:
 *       type: object
 *       properties:
 *         device_id:
 *           type: integer
 *           description: 裝置ID
 *         sensor_rd:
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
const router = express.Router();

const addRouter = require("./add");

router.use("/add", addRouter);

module.exports = router;
