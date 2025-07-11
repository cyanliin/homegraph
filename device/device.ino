#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <SensirionI2CScd4x.h>

// --- Configuration ---
// Wi-Fi Credentials
const char* WIFI_SSID = "VM House TP";
const char* WIFI_PASSWORD = "mint1019";

// API Server
const char* API_HOST = "192.168.0.136"; // 請修改為您 API 伺服器的 IP
const uint16_t API_PORT = 3000;
const char* API_PATH = "/reading/add";

// Device & Sensor IDs (請確保這些 ID 與您資料庫中的設定相符)
const int DEVICE_ID = 1;
const int SENSOR_ID_TEMP = 1;
const int SENSOR_ID_HUMIDITY = 2;
const int SENSOR_ID_CO2 = 3;

// I2C Pins for ESP32-C3
const int I2C_SDA_PIN = 8;
const int I2C_SCL_PIN = 9;

// 更新間隔 (單位：毫秒)
const unsigned long UPDATE_INTERVAL = 60000; // 60 秒
unsigned long lastUpdateTime = 0;

// Global objects
SensirionI2CScd4x scd4x;
WiFiClient client;
HTTPClient http;

/**
 * @brief 連接到 Wi-Fi 網路
 */
void setupWifi() {
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

/**
 * @brief 將感測器數值打包成 JSON 並透過 HTTP POST 傳送
 * @param temperature 溫度
 * @param humidity 濕度
 * @param co2 二氧化碳
 */
void sendData(float temperature, float humidity, float co2) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Skipping data send.");
    return;
  }

  // 建立 JSON 文件
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID;

  JsonArray values = doc["values"].to<JsonArray>();

  JsonObject temp_obj = values.add<JsonObject>();
  temp_obj["sensor_id"] = SENSOR_ID_TEMP;
  temp_obj["value"] = temperature;

  JsonObject hum_obj = values.add<JsonObject>();
  hum_obj["sensor_id"] = SENSOR_ID_HUMIDITY;
  hum_obj["value"] = humidity;

  JsonObject co2_obj = values.add<JsonObject>();
  co2_obj["sensor_id"] = SENSOR_ID_CO2;
  co2_obj["value"] = co2;

  // 將 JSON 序列化為字串
  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // 傳送 HTTP POST 請求
  String apiUrl = "http://" + String(API_HOST) + ":" + String(API_PORT) + String(API_PATH);
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");

  Serial.println("Sending data to API...");
  Serial.println(jsonPayload);

  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.println(response);
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  // while (!Serial); // 等待序列埠準備就緒

  // 初始化 I2C
  Serial.println("Init I2C...");
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  // 初始化 SCD40 感測器
  Serial.println("Init SCD40...");
  uint16_t error;
  char errorMessage[256];
  scd4x.begin(Wire);

  // 停止可能正在運行的測量，以重置感測器
  Serial.println("scd4x.stopPeriodicMeasurement...");
  error = scd4x.stopPeriodicMeasurement();
  if (error) {
    Serial.print("Error trying to execute stopPeriodicMeasurement(): ");
    errorToString(error, errorMessage, 256);
    Serial.println(errorMessage);
  }

  // 開始週期性測量
  Serial.println("scd4x.startPeriodicMeasurement...");
  error = scd4x.startPeriodicMeasurement();
  if (error) {
    Serial.print("Error trying to execute startPeriodicMeasurement(): ");
    errorToString(error, errorMessage, 256);
    Serial.println(errorMessage);
  }

  Serial.println("Waiting for first measurement... (5 seconds)");
  delay(5000);

  // 連接到 WiFi
  setupWifi();
}

void loop() {
  if (millis() - lastUpdateTime > UPDATE_INTERVAL) {
    lastUpdateTime = millis();

    uint16_t error;
    char errorMessage[256];
    bool isDataReady = false;

    // 檢查感測器資料是否已準備好
    error = scd4x.getDataReadyFlag(isDataReady);
    if (error) {
      Serial.print("Error trying to execute getDataReadyFlag(): ");
      errorToString(error, errorMessage, 256);
      Serial.println(errorMessage);
      return;
    }

    if (!isDataReady) {
      Serial.println("SCD40 data not ready yet.");
      return;
    }

    // 讀取感測器數值
    float temperature = 0.0f;
    float humidity = 0.0f;
    uint16_t co2 = 0;
    Serial.println("scd4x.readMeasurement...");
    error = scd4x.readMeasurement(co2, temperature, humidity);
    if (error) {
      Serial.print("Error trying to execute readMeasurement(): ");
      errorToString(error, errorMessage, 256);
      Serial.println(errorMessage);
    } else if (co2 == 0) {
      Serial.println("Invalid sensor data, CO2 is 0. Trying again later.");
    } else {
      Serial.printf("CO2: %d ppm\n", co2);
      Serial.printf("Temperature: %.2f °C\n", temperature);
      Serial.printf("Humidity: %.2f %%RH\n", humidity);
      
      // 將資料傳送到伺服器
      Serial.println("sendData...");
      sendData(temperature, humidity, (float)co2);
    }
  }
}
