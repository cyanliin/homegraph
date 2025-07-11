# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 192.168.0.246 (MySQL 5.5.5-10.11.4-MariaDB-1~deb12u1)
# Database: homegraph
# Generation Time: 2025-07-07 15:33:02 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table devices
# ------------------------------------------------------------

DROP TABLE IF EXISTS `devices`;

CREATE TABLE `devices` (
  `device_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `device_name` varchar(255) NOT NULL DEFAULT '',
  `location` int(11) DEFAULT NULL,
  PRIMARY KEY (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `devices` WRITE;
/*!40000 ALTER TABLE `devices` DISABLE KEYS */;

INSERT INTO `devices` (`device_id`, `device_name`, `location`)
VALUES
	(1,'Living Room',NULL),
	(2,'Bedroom',NULL),
	(3,'Balcony',NULL),
;

/*!40000 ALTER TABLE `devices` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table readings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `readings`;

CREATE TABLE `readings` (
  `reading_id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) unsigned DEFAULT NULL,
  `sensor_id` int(11) unsigned DEFAULT NULL,
  `value` decimal(10,2) NOT NULL,
  `timestamp` timestamp NOT NULL,
  PRIMARY KEY (`reading_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



# Dump of table sensors
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sensors`;

CREATE TABLE `sensors` (
  `sensor_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `sensor_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`sensor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `sensors` WRITE;
/*!40000 ALTER TABLE `sensors` DISABLE KEYS */;

INSERT INTO `sensors` (`sensor_id`, `sensor_name`)
VALUES
	(1,'temperature'),
	(2,'humidity'),
	(3,'co2'),

/*!40000 ALTER TABLE `sensors` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- 為 readings 表格的 device_id 欄位新增外鍵
ALTER TABLE `readings`
ADD CONSTRAINT `fk_readings_device`
FOREIGN KEY (`device_id`) REFERENCES `devices` (`device_id`)
ON DELETE SET NULL ON UPDATE CASCADE;

-- 為 readings 表格的 sensor_id 欄位新增外鍵
ALTER TABLE `readings`
ADD CONSTRAINT `fk_readings_sensor`
FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`)
ON DELETE SET NULL ON UPDATE CASCADE;