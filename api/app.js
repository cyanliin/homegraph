const path = require('path');
const express = require('express');
require('dotenv').config(); // 載入 .env 檔案
const bodyParser = require('body-parser');
const cors = require('cors');
const { log, ExpressAPILogMiddleware } = require('@rama41222/node-logger');
const db = require('./db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');

process.env.TZ = 'Asia/Taipei';

const config = {
  name: 'homegraph-api',
  port: process.env.API_PORT || 3000,
  host: process.env.API_HOST || '0.0.0.0',
};

const app = express();
const logger = log({ console: true, file: false, label: config.name });

app.use(bodyParser.json());
app.use(cors());
app.use(ExpressAPILogMiddleware(logger, { request: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// 靜態資源的路徑
app.use('/appdata', express.static(path.join(__dirname, 'appdata')));

// 首頁
app.get('/', (req, res) => {
  res.status(200).send('Homegraph.');
});

// 裝置
const device = require('./routers/device');
app.use('/device', device);


// 裝置數值
const reading = require('./routers/reading');
app.use('/reading', reading);


app.listen(config.port, config.host, (e)=> {
  if(e) {
    throw new Error('Internal Server Error');
  }
  logger.info(`${config.name} running on ${config.host}:${config.port}`);
});