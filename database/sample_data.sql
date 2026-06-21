-- ============================================================
-- FILE: database/sample_data.sql
-- PURPOSE: Insert sample tourism data into the database
-- Run after schema.sql
-- ============================================================


-- ============================================================
-- HERITAGE SITES (15 records across all 7 provinces)
-- ============================================================
INSERT INTO heritage_sites (name, category, district, province, description, photo_url, geom) VALUES

-- Bagmati Province
('Pashupatinath Temple',   'Temple',      'Kathmandu', 'Bagmati',
 'Sacred Hindu temple complex on the banks of Bagmati River. UNESCO World Heritage Site.', '',
 ST_SetSRID(ST_MakePoint(85.3487, 27.7106), 4326)),

('Boudhanath Stupa',       'Stupa',       'Kathmandu', 'Bagmati',
 'One of the largest Buddhist stupas in the world. UNESCO World Heritage Site.', '',
 ST_SetSRID(ST_MakePoint(85.3620, 27.7215), 4326)),

('Swayambhunath Stupa',    'Stupa',       'Kathmandu', 'Bagmati',
 'Ancient religious complex atop a hill west of Kathmandu. Also known as Monkey Temple.', '',
 ST_SetSRID(ST_MakePoint(85.2905, 27.7149), 4326)),

('Bhaktapur Durbar Square','Palace',      'Bhaktapur', 'Bagmati',
 'Medieval royal palace complex showcasing traditional Newari architecture.', '',
 ST_SetSRID(ST_MakePoint(85.4298, 27.6727), 4326)),

('Patan Durbar Square',    'Palace',      'Lalitpur',  'Bagmati',
 'Historic palace square with stunning Newari temples and courtyards.', '',
 ST_SetSRID(ST_MakePoint(85.3247, 27.6710), 4326)),

-- Gandaki Province
('World Peace Pagoda',     'Stupa',       'Kaski',     'Gandaki',
 'Buddhist stupa offering panoramic views of Phewa Lake and the Annapurna range.', '',
 ST_SetSRID(ST_MakePoint(83.9281, 28.2096), 4326)),

('Bindhyabasini Temple',   'Temple',      'Kaski',     'Gandaki',
 'Important Hindu temple dedicated to Goddess Bhagwati, located in Pokhara.', '',
 ST_SetSRID(ST_MakePoint(83.9856, 28.2380), 4326)),

('Manakamana Temple',      'Temple',      'Gorkha',    'Gandaki',
 'Famous Hindu temple dedicated to Goddess Manakamana, accessible by cable car.', '',
 ST_SetSRID(ST_MakePoint(84.5667, 27.9333), 4326)),

-- Lumbini Province
('Lumbini Maya Devi Temple','UNESCO Site', 'Rupandehi', 'Lumbini',
 'Birthplace of Lord Gautama Buddha. Sacred garden and pilgrimage site.', '',
 ST_SetSRID(ST_MakePoint(83.2767, 27.4833), 4326)),

('Kapilvastu Palace Ruins', 'Palace',     'Kapilvastu','Lumbini',
 'Archaeological ruins of the ancient palace where Buddha spent his early life.', '',
 ST_SetSRID(ST_MakePoint(83.0500, 27.5667), 4326)),

-- Koshi Province
('Pashupatinath Biratnagar','Temple',     'Morang',    'Koshi',
 'Important Hindu temple complex in eastern Nepal dedicated to Lord Shiva.', '',
 ST_SetSRID(ST_MakePoint(87.2833, 26.4500), 4326)),

('Budhasubba Temple',       'Temple',     'Sunsari',   'Koshi',
 'Sacred Hindu temple in Dharan, one of the most visited temples in eastern Nepal.', '',
 ST_SetSRID(ST_MakePoint(87.2833, 26.8167), 4326)),

-- Madhesh Province
('Janaki Mandir',           'Temple',     'Dhanusha',  'Madhesh',
 'Hindu temple dedicated to Goddess Sita, believed to be her birthplace.', '',
 ST_SetSRID(ST_MakePoint(85.9167, 26.7333), 4326)),

-- Karnali Province
('Rara Lake',               'UNESCO Site','Mugu',      'Karnali',
 'Nepal largest lake, located inside Rara National Park at 2990m altitude.', '',
 ST_SetSRID(ST_MakePoint(82.0833, 29.5167), 4326)),

-- Sudurpashchim Province
('Khaptad National Park',   'UNESCO Site','Bajhang',   'Sudurpashchim',
 'Plateau national park with rich biodiversity and the Khaptad Baba ashram.', '',
 ST_SetSRID(ST_MakePoint(81.2167, 29.3667), 4326));


-- ============================================================
-- HOTELS (15 records across Nepal)
-- ============================================================
INSERT INTO hotels (name, category, district, province, description, contact, geom) VALUES

-- Bagmati Province
('Hotel Yak & Yeti',        'Luxury',    'Kathmandu', 'Bagmati',
 'One of Kathmandu most iconic luxury hotels with heritage architecture and modern amenities.',
 '+977-1-4248999',
 ST_SetSRID(ST_MakePoint(85.3152, 27.7137), 4326)),

('Hotel Shanker',           'Luxury',    'Kathmandu', 'Bagmati',
 'Historic palace hotel built in 1895, offering luxurious rooms in a heritage setting.',
 '+977-1-4410151',
 ST_SetSRID(ST_MakePoint(85.3178, 27.7156), 4326)),

('Thamel Eco Resort',       'Mid-range', 'Kathmandu', 'Bagmati',
 'Eco-friendly hotel in the heart of Thamel with rooftop garden and yoga facilities.',
 '+977-1-4700890',
 ST_SetSRID(ST_MakePoint(85.3089, 27.7172), 4326)),

('Hotel Himalaya',          'Mid-range', 'Lalitpur',  'Bagmati',
 'Comfortable hotel in Lalitpur with mountain views and easy access to Patan.',
 '+977-1-5523900',
 ST_SetSRID(ST_MakePoint(85.3217, 27.6656), 4326)),

('Bhaktapur Guest House',   'Budget',    'Bhaktapur', 'Bagmati',
 'Affordable guest house inside Bhaktapur old city with traditional Newari rooms.',
 '+977-1-6610488',
 ST_SetSRID(ST_MakePoint(85.4267, 27.6712), 4326)),

-- Gandaki Province
('Fish Tail Lodge',         'Luxury',    'Kaski',     'Gandaki',
 'Unique island resort on Phewa Lake accessible only by boat. Stunning mountain views.',
 '+977-61-465071',
 ST_SetSRID(ST_MakePoint(83.9467, 28.2094), 4326)),

('Temple Tree Resort',      'Luxury',    'Kaski',     'Gandaki',
 'Award-winning boutique resort with lush tropical gardens in Lakeside Pokhara.',
 '+977-61-465800',
 ST_SetSRID(ST_MakePoint(83.9556, 28.2089), 4326)),

('Hotel Middle Path',       'Budget',    'Kaski',     'Gandaki',
 'Popular budget hotel in Lakeside with clean rooms and friendly staff.',
 '+977-61-462883',
 ST_SetSRID(ST_MakePoint(83.9578, 28.2067), 4326)),

-- Lumbini Province
('Hotel Nirvana Garden',    'Luxury',    'Rupandehi', 'Lumbini',
 'Peaceful luxury hotel near Lumbini sacred garden with meditation facilities.',
 '+977-71-580270',
 ST_SetSRID(ST_MakePoint(83.2789, 27.4867), 4326)),

('Buddha Maya Garden Hotel','Mid-range', 'Rupandehi', 'Lumbini',
 'Comfortable hotel within walking distance of Maya Devi Temple.',
 '+977-71-580130',
 ST_SetSRID(ST_MakePoint(83.2812, 27.4845), 4326)),

-- Koshi Province
('Hotel Namaskar',          'Mid-range', 'Morang',    'Koshi',
 'Well-appointed hotel in Biratnagar, the commercial hub of eastern Nepal.',
 '+977-21-524567',
 ST_SetSRID(ST_MakePoint(87.2756, 26.4567), 4326)),

('Snowland Hotel',          'Budget',    'Taplejung', 'Koshi',
 'Budget hotel in Taplejung serving as a base for Kanchenjunga trekkers.',
 '+977-24-521089',
 ST_SetSRID(ST_MakePoint(87.6667, 27.3500), 4326)),

-- Madhesh Province
('Hotel Sauraha',           'Mid-range', 'Chitwan',   'Bagmati',
 'Comfortable hotel near Chitwan National Park with jungle safari packages.',
 '+977-56-580089',
 ST_SetSRID(ST_MakePoint(84.4833, 27.5667), 4326)),

-- Karnali Province
('Karnali Lodge',           'Mid-range', 'Surkhet',   'Karnali',
 'Cozy lodge in Birendranagar serving as gateway to Karnali Province tourism.',
 '+977-83-521234',
 ST_SetSRID(ST_MakePoint(81.6167, 28.6000), 4326)),

-- Sudurpashchim Province
('Hotel Seti',              'Budget',    'Kanchanpur','Sudurpashchim',
 'Affordable hotel in Mahendranagar near Shuklaphanta Wildlife Reserve.',
 '+977-99-521456',
 ST_SetSRID(ST_MakePoint(80.1833, 28.9667), 4326));


-- ============================================================
-- RESTAURANTS (15 records across Nepal)
-- ============================================================
INSERT INTO restaurants (name, category, district, province, description, contact, geom) VALUES

-- Bagmati Province
('OR2K Restaurant',         'Continental','Kathmandu', 'Bagmati',
 'Popular Middle Eastern and continental restaurant in Thamel with rooftop seating.',
 '+977-1-4700918',
 ST_SetSRID(ST_MakePoint(85.3083, 27.7178), 4326)),

('Krishnarpan Restaurant',  'Nepali',    'Kathmandu', 'Bagmati',
 'Award-winning fine dining restaurant serving traditional Nepali cuisine in Dwarika Hotel.',
 '+977-1-4479488',
 ST_SetSRID(ST_MakePoint(85.3389, 27.7078), 4326)),

('Roadhouse Cafe',          'Continental','Kathmandu','Bagmati',
 'Trendy cafe in Thamel known for wood-fired pizzas and specialty coffee.',
 '+977-1-4700855',
 ST_SetSRID(ST_MakePoint(85.3094, 27.7167), 4326)),

('Cafe de Temple',          'Cafe',      'Bhaktapur', 'Bagmati',
 'Charming rooftop cafe overlooking Bhaktapur Durbar Square. Famous for yomari.',
 '+977-1-6612234',
 ST_SetSRID(ST_MakePoint(85.4289, 27.6722), 4326)),

('Newari Kitchen',          'Nepali',    'Lalitpur',  'Bagmati',
 'Authentic Newari cuisine restaurant near Patan Durbar Square.',
 '+977-1-5521890',
 ST_SetSRID(ST_MakePoint(85.3256, 27.6723), 4326)),

-- Gandaki Province
('Moondance Restaurant',    'Continental','Kaski',    'Gandaki',
 'Lakeside restaurant in Pokhara with live music and international cuisine.',
 '+977-61-463541',
 ST_SetSRID(ST_MakePoint(83.9567, 28.2078), 4326)),

('Caffe Concerto',          'Cafe',      'Kaski',     'Gandaki',
 'Italian-style cafe in Lakeside Pokhara with freshly baked goods and espresso.',
 '+977-61-464490',
 ST_SetSRID(ST_MakePoint(83.9589, 28.2056), 4326)),

('Thakali Kitchen',         'Nepali',    'Kaski',     'Gandaki',
 'Authentic Thakali dal-bhat restaurant in Pokhara. Famous for mustard flavored dishes.',
 '+977-61-461234',
 ST_SetSRID(ST_MakePoint(83.9845, 28.2367), 4326)),

-- Lumbini Province
('Lumbini Garden Restaurant','Nepali',   'Rupandehi', 'Lumbini',
 'Traditional Nepali restaurant near the sacred Lumbini garden.',
 '+977-71-580345',
 ST_SetSRID(ST_MakePoint(83.2778, 27.4856), 4326)),

('Butwal Food Street',      'Street Food','Rupandehi','Lumbini',
 'Popular street food hub in Butwal with local snacks, momos, and chaat.',
 '+977-71-540678',
 ST_SetSRID(ST_MakePoint(83.4667, 27.7000), 4326)),

-- Koshi Province
('Mitho Khana',             'Nepali',    'Morang',    'Koshi',
 'Beloved local restaurant in Biratnagar serving authentic eastern Nepali cuisine.',
 '+977-21-525678',
 ST_SetSRID(ST_MakePoint(87.2789, 26.4589), 4326)),

('Himalayan Java Coffee',   'Cafe',      'Sunsari',   'Koshi',
 'Popular coffee chain branch in Itahari serving specialty Nepali coffee.',
 '+977-25-587890',
 ST_SetSRID(ST_MakePoint(87.2667, 26.6667), 4326)),

-- Madhesh Province
('Janakpur Mithila Kitchen','Nepali',    'Dhanusha',  'Madhesh',
 'Traditional Maithili cuisine restaurant near Janaki Mandir.',
 '+977-41-520789',
 ST_SetSRID(ST_MakePoint(85.9189, 26.7289), 4326)),

-- Karnali Province
('Surkhet Kitchen',         'Nepali',    'Surkhet',   'Karnali',
 'Simple local restaurant in Birendranagar serving affordable dal-bhat.',
 '+977-83-522345',
 ST_SetSRID(ST_MakePoint(81.6189, 28.6022), 4326)),

-- Sudurpashchim Province
('Far West Flavours',       'Street Food','Kailali',  'Sudurpashchim',
 'Local food stall in Dhangadhi famous for tharu cuisine and local snacks.',
 '+977-91-523456',
 ST_SetSRID(ST_MakePoint(80.5833, 28.6833), 4326));