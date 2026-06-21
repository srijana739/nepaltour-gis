-- ============================================================
-- FILE: database/schema.sql
-- PURPOSE: Creates all tables needed for NepalTour GIS app
-- Run this once in PostgreSQL to set up your database
-- ============================================================


-- STEP 1: Enable PostGIS extension
-- PostGIS adds geographic/spatial support to PostgreSQL.
-- Without this, PostgreSQL cannot store map coordinates (geometry).
-- You only need to run this once per database.
CREATE EXTENSION IF NOT EXISTS postgis;


-- ============================================================
-- STEP 2: BOUNDARY TABLES
-- These store the shapes of Nepal's administrative boundaries
-- (province borders, district borders, local level borders).
-- These will appear as overlay layers on the map.
-- ============================================================

-- Province boundary table (7 provinces of Nepal)
CREATE TABLE provinces (
  id            SERIAL PRIMARY KEY,   -- Auto-incrementing unique ID
  name          VARCHAR(100),          -- Province name e.g. "Bagmati"
  geom          GEOMETRY(MultiPolygon, 4326)  -- The actual border shape
  -- 4326 = WGS84 coordinate system (standard GPS coordinates)
);

-- District boundary table (77 districts of Nepal)
CREATE TABLE districts (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100),          -- District name e.g. "Kathmandu"
  province_name VARCHAR(100),          -- Which province it belongs to
  geom          GEOMETRY(MultiPolygon, 4326)
);

-- Local level boundary table (753 municipalities/rural municipalities)
CREATE TABLE local_levels (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100),          -- e.g. "Kathmandu Metropolitan City"
  district_name VARCHAR(100),          -- Which district it belongs to
  type          VARCHAR(50),           -- "Municipality" or "Rural Municipality"
  geom          GEOMETRY(MultiPolygon, 4326)
);


-- ============================================================
-- STEP 3: TOURISM POINT TABLES
-- These store individual tourism locations as points (lat/lng).
-- Each row = one place on the map.
-- ============================================================

-- Heritage sites table
-- Examples: Pashupatinath, Boudhanath, Bhaktapur Durbar Square
CREATE TABLE heritage_sites (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150),            -- Place name
  category    VARCHAR(50),             -- Temple / Stupa / Palace / UNESCO Site
  district    VARCHAR(100),            -- Which district
  province    VARCHAR(100),            -- Which province
  description TEXT,                    -- Short description shown in popup
  photo_url   TEXT,                    -- Link to a photo (optional)
  geom        GEOMETRY(Point, 4326)    -- The GPS location (a single point)
);

-- Hotels table
-- Examples: Hotel Yak & Yeti, Tiger Tops, The Pavilions Himalayas
CREATE TABLE hotels (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150),
  category    VARCHAR(50),             -- Budget / Mid-range / Luxury
  district    VARCHAR(100),
  province    VARCHAR(100),
  description TEXT,
  contact     VARCHAR(100),            -- Phone number or website
  geom        GEOMETRY(Point, 4326)
);

-- Restaurants table
-- Examples: OR2K, Hyatt restaurants, local dal-bhat places
CREATE TABLE restaurants (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150),
  category    VARCHAR(50),             -- Nepali / Continental / Cafe / Street Food
  district    VARCHAR(100),
  province    VARCHAR(100),
  description TEXT,
  contact     VARCHAR(100),
  geom        GEOMETRY(Point, 4326)
);


-- ============================================================
-- STEP 4: SPATIAL INDEXES
-- An index makes location-based searches MUCH faster.
-- Without indexes, a "find nearest hotel" query scans
-- every single row. With indexes, PostGIS jumps straight
-- to nearby rows. Always add these for geometry columns.
-- ============================================================

CREATE INDEX idx_provinces_geom    ON provinces      USING GIST (geom);
CREATE INDEX idx_districts_geom    ON districts      USING GIST (geom);
CREATE INDEX idx_local_geom        ON local_levels   USING GIST (geom);
CREATE INDEX idx_heritage_geom     ON heritage_sites USING GIST (geom);
CREATE INDEX idx_hotels_geom       ON hotels         USING GIST (geom);
CREATE INDEX idx_restaurants_geom  ON restaurants    USING GIST (geom);


-- ============================================================
-- DONE! Your database structure is ready.
-- Next step: insert sample data (we'll do this separately).
-- ============================================================