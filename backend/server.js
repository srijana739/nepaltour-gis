// ============================================================
// FILE: backend/server.js
// PURPOSE: Express web server — connects frontend map to
//          PostgreSQL/PostGIS database
// ============================================================

// Load secret values from .env file into process.env
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');

const app = express();

// --------------------------------------------------------
// CORS: allows the browser (frontend) to talk to this
// server. Without this, the browser blocks all requests.
// --------------------------------------------------------
app.use(cors());
app.use(express.json());

// --------------------------------------------------------
// DATABASE CONNECTION
// Pool = a group of reusable database connections.
// We read the values from .env (never hardcoded here).
// --------------------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test the database connection when server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// --------------------------------------------------------
// HELPER FUNCTION: Convert database rows into GeoJSON
// GeoJSON is the standard format Leaflet understands.
// Every row becomes a "Feature" with geometry + properties.
// --------------------------------------------------------
function toGeoJSON(rows) {
  return {
    type: 'FeatureCollection',
    features: rows.map(row => {
      // Pull geometry out separately, rest becomes properties
      const { geometry, ...properties } = row;
      return {
        type: 'Feature',
        geometry: geometry,        // The coordinates (point or polygon)
        properties: properties     // Everything else (name, category, etc.)
      };
    })
  };
}

// ============================================================
// API ROUTES
// These are the URLs the frontend will call to get data.
// ============================================================

// --------------------------------------------------------
// ROUTE 1: GET /api/heritage
// Returns all heritage sites as GeoJSON
// Optional filters: ?category=Temple&province=Bagmati&district=Kathmandu
//
// Example calls:
//   /api/heritage
//   /api/heritage?province=Bagmati
//   /api/heritage?category=Stupa&district=Kathmandu
// --------------------------------------------------------
app.get('/api/heritage', async (req, res) => {
  const { category, province, district } = req.query;

  // Build WHERE clause dynamically based on what filters are sent
  const conditions = [];
  const values     = [];
  let i = 1; // PostgreSQL uses $1, $2, $3 for placeholders

  if (category) { conditions.push(`category = $${i++}`); values.push(category); }
  if (province) { conditions.push(`province = $${i++}`); values.push(province); }
  if (district) { conditions.push(`district = $${i++}`); values.push(district); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      // ST_AsGeoJSON converts PostGIS geometry to GeoJSON format
      // ::json turns it from a string into actual JSON
      `SELECT id, name, category, district, province, description, photo_url,
              ST_AsGeoJSON(geom)::json AS geometry
       FROM heritage_sites ${where}
       ORDER BY name;`,
      values
    );
    res.json(toGeoJSON(result.rows));
  } catch (err) {
    console.error('Error fetching heritage sites:', err.message);
    res.status(500).json({ error: 'Failed to fetch heritage sites' });
  }
});

// --------------------------------------------------------
// ROUTE 2: GET /api/hotels
// Returns all hotels as GeoJSON
// Optional filters: ?category=Luxury&province=Gandaki
// --------------------------------------------------------
app.get('/api/hotels', async (req, res) => {
  const { category, province, district } = req.query;

  const conditions = [];
  const values     = [];
  let i = 1;

  if (category) { conditions.push(`category = $${i++}`); values.push(category); }
  if (province) { conditions.push(`province = $${i++}`); values.push(province); }
  if (district) { conditions.push(`district = $${i++}`); values.push(district); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT id, name, category, district, province, description, contact,
              ST_AsGeoJSON(geom)::json AS geometry
       FROM hotels ${where}
       ORDER BY name;`,
      values
    );
    res.json(toGeoJSON(result.rows));
  } catch (err) {
    console.error('Error fetching hotels:', err.message);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

// --------------------------------------------------------
// ROUTE 3: GET /api/restaurants
// Returns all restaurants as GeoJSON
// Optional filters: ?category=Nepali&province=Lumbini
// --------------------------------------------------------
app.get('/api/restaurants', async (req, res) => {
  const { category, province, district } = req.query;

  const conditions = [];
  const values     = [];
  let i = 1;

  if (category) { conditions.push(`category = $${i++}`); values.push(category); }
  if (province) { conditions.push(`province = $${i++}`); values.push(province); }
  if (district) { conditions.push(`district = $${i++}`); values.push(district); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT id, name, category, district, province, description, contact,
              ST_AsGeoJSON(geom)::json AS geometry
       FROM restaurants ${where}
       ORDER BY name;`,
      values
    );
    res.json(toGeoJSON(result.rows));
  } catch (err) {
    console.error('Error fetching restaurants:', err.message);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// --------------------------------------------------------
// ROUTE 4: GET /api/boundaries/:level
// Returns boundary polygons for province, district, or local level
//
// Example calls:
//   /api/boundaries/province   ← all 7 provinces
//   /api/boundaries/district   ← all 77 districts
//   /api/boundaries/local      ← all 753 local levels
// --------------------------------------------------------
app.get('/api/boundaries/:level', async (req, res) => {
  const level = req.params.level;

  // Map URL parameter to actual table name
  const tableMap = {
    province: 'provinces',
    district: 'districts',
    local:    'local_levels'
  };

  const table = tableMap[level];

  if (!table) {
    return res.status(400).json({ error: 'Invalid level. Use: province, district, or local' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, ST_AsGeoJSON(geom)::json AS geometry
       FROM ${table}
       ORDER BY name;`
    );
    res.json(toGeoJSON(result.rows));
  } catch (err) {
    console.error(`Error fetching ${level} boundaries:`, err.message);
    res.status(500).json({ error: `Failed to fetch ${level} boundaries` });
  }
});

// --------------------------------------------------------
// ROUTE 5: GET /api/nearest
// Finds the nearest hotels/restaurants/heritage to a point
// This uses PostGIS spatial query (not Turf.js — runs in DB)
//
// Required: ?lat=27.71&lng=85.31&type=hotels
// Optional: &limit=5
//
// Example:
//   /api/nearest?lat=27.71&lng=85.31&type=hotels&limit=3
// --------------------------------------------------------
app.get('/api/nearest', async (req, res) => {
  const { lat, lng, type, limit = 5 } = req.query;

  if (!lat || !lng || !type) {
    return res.status(400).json({ error: 'Missing required params: lat, lng, type' });
  }

  const tableMap = {
    hotels:      'hotels',
    restaurants: 'restaurants',
    heritage:    'heritage_sites'
  };

  const table = tableMap[type];
  if (!table) {
    return res.status(400).json({ error: 'Invalid type. Use: hotels, restaurants, or heritage' });
  }

  try {
    const result = await pool.query(
      // ST_Distance calculates real-world distance in meters
      // <-> is the PostGIS nearest-neighbor index operator (very fast)
      // ::geography converts coordinates to use meters instead of degrees
      `SELECT id, name, category, district, province,
              ST_AsGeoJSON(geom)::json AS geometry,
              ROUND(
                ST_Distance(
                  geom::geography,
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                )::numeric
              , 0) AS distance_meters
       FROM ${table}
       ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)
       LIMIT $3;`,
      [lng, lat, limit]
    );
    res.json(toGeoJSON(result.rows));
  } catch (err) {
    console.error('Error finding nearest:', err.message);
    res.status(500).json({ error: 'Failed to find nearest locations' });
  }
});

// --------------------------------------------------------
// ROUTE 6: GET /api/search?name=pashupatinath
// Searches across all three tourism tables by name
// Uses ILIKE for case-insensitive partial matching
//
// Example:
//   /api/search?name=pash   ← finds "Pashupatinath Temple"
// --------------------------------------------------------
app.get('/api/search', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Missing required param: name' });
  }

  try {
    // Search all three tables at once using UNION ALL
    const result = await pool.query(
      `SELECT id, name, category, district, province, description,
              'heritage' AS type,
              ST_AsGeoJSON(geom)::json AS geometry
       FROM heritage_sites WHERE name ILIKE $1
       UNION ALL
       SELECT id, name, category, district, province, description,
              'hotel' AS type,
              ST_AsGeoJSON(geom)::json AS geometry
       FROM hotels WHERE name ILIKE $1
       UNION ALL
       SELECT id, name, category, district, province, description,
              'restaurant' AS type,
              ST_AsGeoJSON(geom)::json AS geometry
       FROM restaurants WHERE name ILIKE $1
       ORDER BY name;`,
      [`%${name}%`] // % means "anything before or after"
    );
    res.json(toGeoJSON(result.rows));
  } catch (err) {
    console.error('Error searching:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================================
// START THE SERVER
// Reads PORT from .env (default 5000 if not set)
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 NepalTour GIS server running at http://localhost:${PORT}`);
  console.log(`   Available routes:`);
  console.log(`   GET /api/heritage`);
  console.log(`   GET /api/hotels`);
  console.log(`   GET /api/restaurants`);
  console.log(`   GET /api/boundaries/:level`);
  console.log(`   GET /api/nearest?lat=&lng=&type=`);
  console.log(`   GET /api/search?name=`);
});