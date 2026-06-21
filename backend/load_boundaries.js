// ============================================================
// FILE: backend/load_boundaries.js
// PURPOSE: Reads shapefiles and loads boundary data into
//          PostgreSQL without needing ogr2ogr or GDAL
// Run once with: node load_boundaries.js
// ============================================================

require('dotenv').config();
const shapefile = require('shapefile');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Path to your boundaries folder
const BOUNDARIES_DIR = path.join(__dirname, '..', 'database', 'boundaries');

// ============================================================
// Load provinces (admin1)
// Column in shapefile: adm1_name
// ============================================================
async function loadProvinces() {
  console.log('\n📂 Loading provinces...');

  // Clear existing data first
  await pool.query('DELETE FROM provinces');

  const source = await shapefile.open(
    path.join(BOUNDARIES_DIR, 'npl_admin1.shp'),
    path.join(BOUNDARIES_DIR, 'npl_admin1.dbf')
  );

  let count = 0;

  while (true) {
    const result = await source.read();
    if (result.done) break;

    const feature = result.value;
    const name    = feature.properties.adm1_name || 'Unknown';
    const geom    = JSON.stringify(feature.geometry);

    await pool.query(
      `INSERT INTO provinces (name, geom)
       VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))`,
      [name, geom]
    );

    count++;
    process.stdout.write(`\r   Inserted ${count} provinces...`);
  }

  console.log(`\n✅ Provinces done: ${count} records`);
}

// ============================================================
// Load districts (admin2)
// Columns: adm2_name (district), adm1_name (province)
// ============================================================
async function loadDistricts() {
  console.log('\n📂 Loading districts...');

  await pool.query('DELETE FROM districts');

  const source = await shapefile.open(
    path.join(BOUNDARIES_DIR, 'npl_admin2.shp'),
    path.join(BOUNDARIES_DIR, 'npl_admin2.dbf')
  );

  let count = 0;

  while (true) {
    const result = await source.read();
    if (result.done) break;

    const feature      = result.value;
    const name         = feature.properties.adm2_name  || 'Unknown';
    const province     = feature.properties.adm1_name  || 'Unknown';
    const geom         = JSON.stringify(feature.geometry);

    await pool.query(
      `INSERT INTO districts (name, province_name, geom)
       VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326))`,
      [name, province, geom]
    );

    count++;
    process.stdout.write(`\r   Inserted ${count} districts...`);
  }

  console.log(`\n✅ Districts done: ${count} records`);
}

// ============================================================
// Load local levels (admin3)
// Columns: adm3_name (local), adm2_name (district)
// ============================================================
async function loadLocalLevels() {
  console.log('\n📂 Loading local levels (this may take a minute)...');

  await pool.query('DELETE FROM local_levels');

  const source = await shapefile.open(
    path.join(BOUNDARIES_DIR, 'npl_admin3.shp'),
    path.join(BOUNDARIES_DIR, 'npl_admin3.dbf')
  );

  let count = 0;

  while (true) {
    const result = await source.read();
    if (result.done) break;

    const feature  = result.value;
    const name     = feature.properties.adm3_name || 'Unknown';
    const district = feature.properties.adm2_name || 'Unknown';
    const geom     = JSON.stringify(feature.geometry);

    await pool.query(
      `INSERT INTO local_levels (name, district_name, geom)
       VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326))`,
      [name, district, geom]
    );

    count++;
    process.stdout.write(`\r   Inserted ${count} local levels...`);
  }

  console.log(`\n✅ Local levels done: ${count} records`);
}

// ============================================================
// Run all three loaders in sequence
// ============================================================
async function main() {
  console.log('🚀 Starting boundary data import...');

  try {
    await loadProvinces();
    await loadDistricts();
    await loadLocalLevels();

    console.log('\n🎉 All boundaries loaded successfully!');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();