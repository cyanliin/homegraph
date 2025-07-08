# Homegraph
家庭環境數據整合系統。

|模組       |資料夾  |URL               |說明
|----------|-------|-------------------|----------------
|主系統 API |/api   |192.168.0.xxx:3000 |Node.js, MariaDB
|監控面板   |/app    |192.168.0.xxx:5173|Vue3, Typescript
|感測裝置   |/device |                  |Arduino

## 一、初始化

###
```sh
# 使用 Node.js v22
nvm use 22

# API 專案初始化
cd api
pnpm install

# 監控面板 專案初始化
cd ../app
pnpm install
```

### 使用 PM2 設定開機自動後背景執行 API
```sh

# 啟動 API 程式
cd api
pm2 start "pnpm start" --name homegraph-api

# 儲存目前的 PM2 狀態（讓它記得有哪些程式要開機啟動)
pm2 save

# 讓 PM2 在開機時自動啟動
pm2 startup
```

以上指令會輸出類似以下的東西：
```sh
[PM2] Init system found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/home/pi/.local/share/pnpm pm2 startup systemd -u pi --hp /home/pi
```
依照你看到的提示，把那行 sudo env PATH=... pm2 startup ... 貼上執行即可。

這一步會建立 systemd 的服務單元，使得開機時會自動執行。

### PM2 常用操作
```sh
# 查看目前狀態
pm2 list

# 查看 Log
pm2 logs homegraph-api

# 停止正在執行的專案
pm2 stop homegraph-api

# 從 PM2 中刪除這個專案（完全移除，不再自動啟動）
pm2 delete homegraph-api

# 取消開機自動啟動（整個 PM2）
pm2 unstartup

```

<br/><br/>

## 二、主系統 API

提供數值存取 API 的主要系統，供裝置感測數值傳入，與提供數值給監控面板。是一個獨立的 Node.js, express 專案。

專案路徑
```
/api
```

URL
```
http://192.168.0.xxx:3000/
```

Swagger API 文件
```
http://192.168.0.xxx:3000/api-docs
```

<br/><br/>

## 三、監控面板

監控面板系統，提供 web 介面給顯示裝置，定時發送 API 請求並顯示。是一個獨立的 Vue3 專案。

專案路徑
```
/app
```

URL
```
http://192.168.0.xxx:5173/
```

<br/><br/>


## 四、感測裝置

Arduino 感測裝置的韌體，定期感測環境數值，並傳送給 API。須先設定 API URL、裝置編號，再進行燒錄。

專案路徑
```
/device
```

<br/><br/>

## 五、資料庫說明
引入檔：
```
\api\db-import.sql
```

|#  |表名稱    |說明
|---|---------|-------------
|1  |devices  |裝置列表
|2  |sensors  |感應器類型
|3  |readings |數值紀錄

### 資料表1：devices
|Column       |Type        |Default|說明
|-------------|------------|-------|-----------
|device_id    |INT(11)     |       |Primary Key
|device_name  |VARCHAR(255)|       |裝置名稱
|location     |INT(11)     |       |位置 Id

### 資料表2：sensors
|Column      |Type        |Default|說明
|------------|------------|-------|----
|sensor_id   |INT(11)     |       |Primary Key
|sensor_name |VARCHAR(255)|       |感應類型名稱

### 資料表3：readings
|Column     |Type         |Default            |說明
|-----------|-------------|-------------------|---
|reading_id |INT(11)      |                   |Primary Key
|device_id  |INT(11)      |                   |裝置 ID
|sensor_id  |INT(11)      |                   |感應類型 ID
|value      |DECIMAL(10,2)|                   |數值
|timestamp  |TIMESTAMP    |current_timestamp()|紀錄時間





