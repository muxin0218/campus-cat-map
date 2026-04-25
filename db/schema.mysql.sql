-- Campus Stray Cat Map - MySQL 8.0+ schema
-- Charset: utf8mb4, Engine: InnoDB

CREATE DATABASE IF NOT EXISTS campus_cat_map
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE campus_cat_map;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(32) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_username (username)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cats (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  sex ENUM('unknown', 'male', 'female') NOT NULL DEFAULT 'unknown',
  description VARCHAR(500) NULL,
  neutered TINYINT(1) NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cats_name (name),
  KEY idx_cats_created_at (created_at),
  CONSTRAINT fk_cats_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cat_photos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cat_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(512) NOT NULL,
  uploaded_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cat_photos_cat_id_created_at (cat_id, created_at),
  CONSTRAINT fk_cat_photos_cat
    FOREIGN KEY (cat_id) REFERENCES cats(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cat_photos_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sightings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cat_id BIGINT UNSIGNED NOT NULL,
  reporter_id BIGINT UNSIGNED NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  location POINT SRID 4326 AS (ST_SRID(POINT(longitude, latitude), 4326)) STORED,
  note VARCHAR(500) NULL,
  happened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sightings_cat_id_happened_at (cat_id, happened_at),
  SPATIAL INDEX idx_sightings_location (location),
  CONSTRAINT fk_sightings_cat
    FOREIGN KEY (cat_id) REFERENCES cats(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sightings_reporter
    FOREIGN KEY (reporter_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feeding_points (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  location POINT SRID 4326 AS (ST_SRID(POINT(longitude, latitude), 4326)) STORED,
  description VARCHAR(500) NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_feeding_points_name (name),
  SPATIAL INDEX idx_feeding_points_location (location),
  CONSTRAINT fk_feeding_points_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feeding_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  feeding_point_id BIGINT UNSIGNED NOT NULL,
  feeder_id BIGINT UNSIGNED NULL,
  food_type VARCHAR(50) NULL,
  amount VARCHAR(50) NULL,
  note VARCHAR(500) NULL,
  fed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_feeding_events_point_id_fed_at (feeding_point_id, fed_at),
  CONSTRAINT fk_feeding_events_point
    FOREIGN KEY (feeding_point_id) REFERENCES feeding_points(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_feeding_events_feeder
    FOREIGN KEY (feeder_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

