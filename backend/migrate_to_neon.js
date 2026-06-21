// ============================================================
// FILE: backend/migrate_to_neon.js
// PURPOSE: Creates tables and loads all data into Neon cloud DB
// Run once with: node migrate_to_neon.js
// ============================================================

require('dotenv').config();
const { Pool } = require('pg');
const shapefile = require('shapefile');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const BOUNDARIES_DIR = path.join(__dirname, '..', 'database', 'boundaries');

// ============================================================
// STEP 1: Create all tables
// ============================================================
async function createTables() {
  console.log('\n📋 Creating tables...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provinces (
      id   SERIAL PRIMARY KEY,
      name VARCHAR(100),
      geom GEOMETRY(MultiPolygon, 4326)
    );

    CREATE TABLE IF NOT EXISTS districts (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(100),
      province_name VARCHAR(100),
      geom          GEOMETRY(MultiPolygon, 4326)
    );

    CREATE TABLE IF NOT EXISTS local_levels (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(100),
      district_name VARCHAR(100),
      type          VARCHAR(50),
      geom          GEOMETRY(MultiPolygon, 4326)
    );

    CREATE TABLE IF NOT EXISTS heritage_sites (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(150),
      category    VARCHAR(50),
      district    VARCHAR(100),
      province    VARCHAR(100),
      description TEXT,
      photo_url   TEXT,
      geom        GEOMETRY(Point, 4326)
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(150),
      category    VARCHAR(50),
      district    VARCHAR(100),
      province    VARCHAR(100),
      description TEXT,
      contact     VARCHAR(100),
      geom        GEOMETRY(Point, 4326)
    );

    CREATE TABLE IF NOT EXISTS restaurants (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(150),
      category    VARCHAR(50),
      district    VARCHAR(100),
      province    VARCHAR(100),
      description TEXT,
      contact     VARCHAR(100),
      geom        GEOMETRY(Point, 4326)
    );
  `);

  console.log('✅ Tables created');
}

// ============================================================
// STEP 2: Create spatial indexes
// ============================================================
async function createIndexes() {
  console.log('\n📋 Creating spatial indexes...');

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_provinces_geom   ON provinces      USING GIST (geom);
    CREATE INDEX IF NOT EXISTS idx_districts_geom   ON districts      USING GIST (geom);
    CREATE INDEX IF NOT EXISTS idx_local_geom       ON local_levels   USING GIST (geom);
    CREATE INDEX IF NOT EXISTS idx_heritage_geom    ON heritage_sites USING GIST (geom);
    CREATE INDEX IF NOT EXISTS idx_hotels_geom      ON hotels         USING GIST (geom);
    CREATE INDEX IF NOT EXISTS idx_restaurants_geom ON restaurants    USING GIST (geom);
  `);

  console.log('✅ Indexes created');
}

// ============================================================
// STEP 3: Load heritage sites
// ============================================================
async function loadHeritage() {
  console.log('\n🏛️  Loading heritage sites...');
  await pool.query('DELETE FROM heritage_sites');

  await pool.query(`
    INSERT INTO heritage_sites (name, category, district, province, description, photo_url, geom) VALUES
    ('Pashupatinath Temple','Temple','Kathmandu','Bagmati','Sacred Hindu temple complex on the banks of Bagmati River. UNESCO World Heritage Site.','',ST_SetSRID(ST_MakePoint(85.3487,27.7106),4326)),
    ('Boudhanath Stupa','Stupa','Kathmandu','Bagmati','One of the largest Buddhist stupas in the world. UNESCO World Heritage Site.','',ST_SetSRID(ST_MakePoint(85.3620,27.7215),4326)),
    ('Swayambhunath Stupa','Stupa','Kathmandu','Bagmati','Ancient religious complex atop a hill west of Kathmandu. Also known as Monkey Temple.','',ST_SetSRID(ST_MakePoint(85.2905,27.7149),4326)),
    ('Bhaktapur Durbar Square','Palace','Bhaktapur','Bagmati','Medieval royal palace complex showcasing traditional Newari architecture.','',ST_SetSRID(ST_MakePoint(85.4298,27.6727),4326)),
    ('Patan Durbar Square','Palace','Lalitpur','Bagmati','Historic palace square with stunning Newari temples and courtyards.','',ST_SetSRID(ST_MakePoint(85.3247,27.6710),4326)),
    ('World Peace Pagoda','Stupa','Kaski','Gandaki','Buddhist stupa offering panoramic views of Phewa Lake and the Annapurna range.','',ST_SetSRID(ST_MakePoint(83.9281,28.2096),4326)),
    ('Bindhyabasini Temple','Temple','Kaski','Gandaki','Important Hindu temple dedicated to Goddess Bhagwati, located in Pokhara.','',ST_SetSRID(ST_MakePoint(83.9856,28.2380),4326)),
    ('Manakamana Temple','Temple','Gorkha','Gandaki','Famous Hindu temple dedicated to Goddess Manakamana, accessible by cable car.','',ST_SetSRID(ST_MakePoint(84.5667,27.9333),4326)),
    ('Lumbini Maya Devi Temple','UNESCO Site','Rupandehi','Lumbini','Birthplace of Lord Gautama Buddha. Sacred garden and pilgrimage site.','',ST_SetSRID(ST_MakePoint(83.2767,27.4833),4326)),
    ('Kapilvastu Palace Ruins','Palace','Kapilvastu','Lumbini','Archaeological ruins of the ancient palace where Buddha spent his early life.','',ST_SetSRID(ST_MakePoint(83.0500,27.5667),4326)),
    ('Pashupatinath Biratnagar','Temple','Morang','Koshi','Important Hindu temple complex in eastern Nepal dedicated to Lord Shiva.','',ST_SetSRID(ST_MakePoint(87.2833,26.4500),4326)),
    ('Budhasubba Temple','Temple','Sunsari','Koshi','Sacred Hindu temple in Dharan, one of the most visited temples in eastern Nepal.','',ST_SetSRID(ST_MakePoint(87.2833,26.8167),4326)),
    ('Janaki Mandir','Temple','Dhanusha','Madhesh','Hindu temple dedicated to Goddess Sita, believed to be her birthplace.','',ST_SetSRID(ST_MakePoint(85.9167,26.7333),4326)),
    ('Rara Lake','UNESCO Site','Mugu','Karnali','Nepal largest lake, located inside Rara National Park at 2990m altitude.','',ST_SetSRID(ST_MakePoint(82.0833,29.5167),4326)),
    ('Khaptad National Park','UNESCO Site','Bajhang','Sudurpashchim','Plateau national park with rich biodiversity and the Khaptad Baba ashram.','',ST_SetSRID(ST_MakePoint(81.2167,29.3667),4326));
  `);

  console.log('✅ Heritage sites loaded: 15 records');
}

// ============================================================
// STEP 4: Load hotels
// ============================================================
async function loadHotels() {
  console.log('\n🏨  Loading hotels...');
  await pool.query('DELETE FROM hotels');

  await pool.query(`
    INSERT INTO hotels (name, category, district, province, description, contact, geom) VALUES
    ('Hotel Yak & Yeti','Luxury','Kathmandu','Bagmati','One of Kathmandu most iconic luxury hotels with heritage architecture.','+977-1-4248999',ST_SetSRID(ST_MakePoint(85.3152,27.7137),4326)),
    ('Hotel Shanker','Luxury','Kathmandu','Bagmati','Historic palace hotel built in 1895, offering luxurious rooms in a heritage setting.','+977-1-4410151',ST_SetSRID(ST_MakePoint(85.3178,27.7156),4326)),
    ('Thamel Eco Resort','Mid-range','Kathmandu','Bagmati','Eco-friendly hotel in the heart of Thamel with rooftop garden and yoga facilities.','+977-1-4700890',ST_SetSRID(ST_MakePoint(85.3089,27.7172),4326)),
    ('Hotel Himalaya','Mid-range','Lalitpur','Bagmati','Comfortable hotel in Lalitpur with mountain views and easy access to Patan.','+977-1-5523900',ST_SetSRID(ST_MakePoint(85.3217,27.6656),4326)),
    ('Bhaktapur Guest House','Budget','Bhaktapur','Bagmati','Affordable guest house inside Bhaktapur old city with traditional Newari rooms.','+977-1-6610488',ST_SetSRID(ST_MakePoint(85.4267,27.6712),4326)),
    ('Fish Tail Lodge','Luxury','Kaski','Gandaki','Unique island resort on Phewa Lake accessible only by boat. Stunning mountain views.','+977-61-465071',ST_SetSRID(ST_MakePoint(83.9467,28.2094),4326)),
    ('Temple Tree Resort','Luxury','Kaski','Gandaki','Award-winning boutique resort with lush tropical gardens in Lakeside Pokhara.','+977-61-465800',ST_SetSRID(ST_MakePoint(83.9556,28.2089),4326)),
    ('Hotel Middle Path','Budget','Kaski','Gandaki','Popular budget hotel in Lakeside with clean rooms and friendly staff.','+977-61-462883',ST_SetSRID(ST_MakePoint(83.9578,28.2067),4326)),
    ('Hotel Nirvana Garden','Luxury','Rupandehi','Lumbini','Peaceful luxury hotel near Lumbini sacred garden with meditation facilities.','+977-71-580270',ST_SetSRID(ST_MakePoint(83.2789,27.4867),4326)),
    ('Buddha Maya Garden Hotel','Mid-range','Rupandehi','Lumbini','Comfortable hotel within walking distance of Maya Devi Temple.','+977-71-580130',ST_SetSRID(ST_MakePoint(83.2812,27.4845),4326)),
    ('Hotel Namaskar','Mid-range','Morang','Koshi','Well-appointed hotel in Biratnagar, the commercial hub of eastern Nepal.','+977-21-524567',ST_SetSRID(ST_MakePoint(87.2756,26.4567),4326)),
    ('Snowland Hotel','Budget','Taplejung','Koshi','Budget hotel in Taplejung serving as a base for Kanchenjunga trekkers.','+977-24-521089',ST_SetSRID(ST_MakePoint(87.6667,27.3500),4326)),
    ('Hotel Sauraha','Mid-range','Chitwan','Bagmati','Comfortable hotel near Chitwan National Park with jungle safari packages.','+977-56-580089',ST_SetSRID(ST_MakePoint(84.4833,27.5667),4326)),
    ('Karnali Lodge','Mid-range','Surkhet','Karnali','Cozy lodge in Birendranagar serving as gateway to Karnali Province tourism.','+977-83-521234',ST_SetSRID(ST_MakePoint(81.6167,28.6000),4326)),
    ('Hotel Seti','Budget','Kanchanpur','Sudurpashchim','Affordable hotel in Mahendranagar near Shuklaphanta Wildlife Reserve.','+977-99-521456',ST_SetSRID(ST_MakePoint(80.1833,28.9667),4326));
  `);

  console.log('✅ Hotels loaded: 15 records');
}

// ============================================================
// STEP 5: Load restaurants
// ============================================================
async function loadRestaurants() {
  console.log('\n🍽️  Loading restaurants...');
  await pool.query('DELETE FROM restaurants');

  await pool.query(`
    INSERT INTO restaurants (name, category, district, province, description, contact, geom) VALUES
    ('OR2K Restaurant','Continental','Kathmandu','Bagmati','Popular Middle Eastern and continental restaurant in Thamel with rooftop seating.','+977-1-4700918',ST_SetSRID(ST_MakePoint(85.3083,27.7178),4326)),
    ('Krishnarpan Restaurant','Nepali','Kathmandu','Bagmati','Award-winning fine dining serving traditional Nepali cuisine in Dwarika Hotel.','+977-1-4479488',ST_SetSRID(ST_MakePoint(85.3389,27.7078),4326)),
    ('Roadhouse Cafe','Continental','Kathmandu','Bagmati','Trendy cafe in Thamel known for wood-fired pizzas and specialty coffee.','+977-1-4700855',ST_SetSRID(ST_MakePoint(85.3094,27.7167),4326)),
    ('Cafe de Temple','Cafe','Bhaktapur','Bagmati','Charming rooftop cafe overlooking Bhaktapur Durbar Square. Famous for yomari.','+977-1-6612234',ST_SetSRID(ST_MakePoint(85.4289,27.6722),4326)),
    ('Newari Kitchen','Nepali','Lalitpur','Bagmati','Authentic Newari cuisine restaurant near Patan Durbar Square.','+977-1-5521890',ST_SetSRID(ST_MakePoint(85.3256,27.6723),4326)),
    ('Moondance Restaurant','Continental','Kaski','Gandaki','Lakeside restaurant in Pokhara with live music and international cuisine.','+977-61-463541',ST_SetSRID(ST_MakePoint(83.9567,28.2078),4326)),
    ('Caffe Concerto','Cafe','Kaski','Gandaki','Italian-style cafe in Lakeside Pokhara with freshly baked goods and espresso.','+977-61-464490',ST_SetSRID(ST_MakePoint(83.9589,28.2056),4326)),
    ('Thakali Kitchen','Nepali','Kaski','Gandaki','Authentic Thakali dal-bhat restaurant in Pokhara. Famous for mustard flavored dishes.','+977-61-461234',ST_SetSRID(ST_MakePoint(83.9845,28.2367),4326)),
    ('Lumbini Garden Restaurant','Nepali','Rupandehi','Lumbini','Traditional Nepali restaurant near the sacred Lumbini garden.','+977-71-580345',ST_SetSRID(ST_MakePoint(83.2778,27.4856),4326)),
    ('Butwal Food Street','Street Food','Rupandehi','Lumbini','Popular street food hub in Butwal with local snacks, momos, and chaat.','+977-71-540678',ST_SetSRID(ST_MakePoint(83.4667,27.7000),4326)),
    ('Mitho Khana','Nepali','Morang','Koshi','Beloved local restaurant in Biratnagar serving authentic eastern Nepali cuisine.','+977-21-525678',ST_SetSRID(ST_MakePoint(87.2789,26.4589),4326)),
    ('Himalayan Java Coffee','Cafe','Sunsari','Koshi','Popular coffee chain branch in Itahari serving specialty Nepali coffee.','+977-25-587890',ST_SetSRID(ST_MakePoint(87.2667,26.6667),4326)),
    ('Janakpur Mithila Kitchen','Nepali','Dhanusha','Madhesh','Traditional Maithili cuisine restaurant near Janaki Mandir.','+977-41-520789',ST_SetSRID(ST_MakePoint(85.9189,26.7289),4326)),
    ('Surkhet Kitchen','Nepali','Surkhet','Karnali','Simple local restaurant in Birendranagar serving affordable dal-bhat.','+977-83-522345',ST_SetSRID(ST_MakePoint(81.6189,28.6022),4326)),
    ('Far West Flavours','Street Food','Kailali','Sudurpashchim','Local food stall in Dhangadhi famous for tharu cuisine and local snacks.','+977-91-523456',ST_SetSRID(ST_MakePoint(80.5833,28.6833),4326));
  `);

  console.log('✅ Restaurants loaded: 15 records');
}

// ============================================================
// STEP 6: Load boundary shapefiles
// ============================================================
async function loadProvinces() {
  console.log('\n🗺️  Loading provinces...');
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
    const name = feature.properties.adm1_name || 'Unknown';
    const geom = JSON.stringify(feature.geometry);
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

async function loadDistricts() {
  console.log('\n🗺️  Loading districts...');
  await pool.query('DELETE FROM districts');

  const source = await shapefile.open(
    path.join(BOUNDARIES_DIR, 'npl_admin2.shp'),
    path.join(BOUNDARIES_DIR, 'npl_admin2.dbf')
  );

  let count = 0;
  while (true) {
    const result = await source.read();
    if (result.done) break;
    const feature  = result.value;
    const name     = feature.properties.adm2_name || 'Unknown';
    const province = feature.properties.adm1_name || 'Unknown';
    const geom     = JSON.stringify(feature.geometry);
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

async function loadLocalLevels() {
  console.log('\n🗺️  Loading local levels (this may take 1-2 minutes)...');
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
// RUN EVERYTHING
// ============================================================
async function main() {
  console.log('🚀 Migrating all data to Neon cloud database...');
  try {
    await createTables();
    await createIndexes();
    await loadHeritage();
    await loadHotels();
    await loadRestaurants();
    await loadProvinces();
    await loadDistricts();
    await loadLocalLevels();
    console.log('\n🎉 Migration complete! All data is now in Neon.');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();