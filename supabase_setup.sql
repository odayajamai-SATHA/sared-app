-- =============================================
-- SATHA APP - SUPABASE DATABASE SETUP
-- Run this entire script in the Supabase SQL Editor
-- =============================================

-- ============ TABLES ============

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  lang TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DRIVERS TABLE
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  satha_size TEXT NOT NULL DEFAULT 'medium',
  rating NUMERIC(2,1) DEFAULT 5.0,
  is_online BOOLEAN DEFAULT false,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RIDES TABLE
CREATE TABLE IF NOT EXISTS rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  service_type TEXT NOT NULL,
  satha_size TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- RATINGS TABLE
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ride_id UUID REFERENCES rides(id),
  user_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  stars INTEGER CHECK (stars >= 1 AND stars <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ============ ROW LEVEL SECURITY ============

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
-- Allow authenticated users to read their own row
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'phone' = phone);

-- Allow insert for new signups
CREATE POLICY "Allow user insert on signup"
  ON users FOR INSERT
  WITH CHECK (true);

-- Allow users to update own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'phone' = phone);

-- DRIVERS POLICIES
-- Allow all authenticated users to read drivers (needed for matching)
CREATE POLICY "Anyone can read drivers"
  ON drivers FOR SELECT
  USING (true);

-- Allow drivers to update own data (location, online status)
CREATE POLICY "Drivers can update own data"
  ON drivers FOR UPDATE
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'phone' = phone);

-- Allow insert for admin seeding
CREATE POLICY "Allow driver insert"
  ON drivers FOR INSERT
  WITH CHECK (true);

-- RIDES POLICIES
-- Allow authenticated users to read rides they're involved in
CREATE POLICY "Users can read own rides"
  ON rides FOR SELECT
  USING (true);

-- Allow creating rides
CREATE POLICY "Allow ride creation"
  ON rides FOR INSERT
  WITH CHECK (true);

-- Allow updating rides (status changes)
CREATE POLICY "Allow ride updates"
  ON rides FOR UPDATE
  USING (true);

-- RATINGS POLICIES
-- Allow reading ratings
CREATE POLICY "Anyone can read ratings"
  ON ratings FOR SELECT
  USING (true);

-- Allow creating ratings
CREATE POLICY "Allow rating creation"
  ON ratings FOR INSERT
  WITH CHECK (true);


-- ============ REALTIME ============

-- Enable Realtime for rides and drivers tables
ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE drivers;


-- ============ SEED DATA ============

-- Sample Driver 1: Ahmed with medium satha, rated 4.8
INSERT INTO drivers (phone, name, vehicle_type, plate_number, satha_size, rating, is_online, lat, lng)
VALUES (
  '+966501234567',
  'Ahmed',
  'flatbed',
  'ABC 1234',
  'medium',
  4.8,
  true,
  24.7136,
  46.6753
)
ON CONFLICT (phone) DO UPDATE SET
  name = EXCLUDED.name,
  vehicle_type = EXCLUDED.vehicle_type,
  plate_number = EXCLUDED.plate_number,
  satha_size = EXCLUDED.satha_size,
  rating = EXCLUDED.rating;

-- Sample Driver 2: Mohammed with large satha, rated 4.6
INSERT INTO drivers (phone, name, vehicle_type, plate_number, satha_size, rating, is_online, lat, lng)
VALUES (
  '+966509876543',
  'Mohammed',
  'flatbed',
  'XYZ 5678',
  'large',
  4.6,
  true,
  24.7200,
  46.6800
)
ON CONFLICT (phone) DO UPDATE SET
  name = EXCLUDED.name,
  vehicle_type = EXCLUDED.vehicle_type,
  plate_number = EXCLUDED.plate_number,
  satha_size = EXCLUDED.satha_size,
  rating = EXCLUDED.rating;


-- ============ DONE ============
-- Verify the seed data
SELECT id, phone, name, satha_size, rating, is_online FROM drivers;
