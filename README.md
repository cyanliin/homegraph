# Homegraph
Home iot system in node.

RestAPI：
- Node.js
- MariaDB

## Setup Database
import db-import.sql

## Database Structure
### devices
|Column|Type|Default|Description|
|------|----|-------|----|
|device_id|INT(11)||Primary Key|
|device_name|VARCHAR(255)||
|location|INT(11)||Location Id

### sensors
|Column|Type|Default|Description|
|------|----|-------|----|
|sensor_id|INT(11)||Primary Key|
|sensor_name|VARCHAR(255)||

### readings
|Column|Type|Default|Description|
|------|----|-------|----|
|reading_id|INT(11)||Primary Key|
|device_id|INT(11)||Device ID
|sensor_id|INT(11)||Sensor ID
|value|DECIMAL(10,2)||Value
|timestamp|TIMESTAMP|current_timestamp()|Time

## API
dev
```
cd api
pnpm dev
```

Swagger API Docs
```
http://192.168.0.xxx:3000/api-docs
```
