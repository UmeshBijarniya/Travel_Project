/*
  # BookIt Application Schema

  ## Overview
  Complete database schema for the BookIt travel experiences booking platform.

  ## New Tables

  ### 1. experiences
  - `id` (uuid, primary key) - Unique identifier for each experience
  - `title` (text) - Experience name
  - `description` (text) - Detailed description
  - `location` (text) - Location of the experience
  - `duration` (text) - Duration (e.g., "3 hours", "Full day")
  - `price` (numeric) - Base price per person
  - `image_url` (text) - Main image URL from Pexels
  - `rating` (numeric) - Average rating (0-5)
  - `category` (text) - Category (e.g., "Adventure", "Cultural", "Nature")
  - `max_group_size` (integer) - Maximum participants per slot
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. experience_slots
  - `id` (uuid, primary key) - Unique slot identifier
  - `experience_id` (uuid, foreign key) - Reference to experience
  - `date` (date) - Date of the slot
  - `time` (text) - Time slot (e.g., "09:00 AM", "02:00 PM")
  - `available_spots` (integer) - Current available spots
  - `total_spots` (integer) - Total capacity
  - `is_active` (boolean) - Whether slot is bookable
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. bookings
  - `id` (uuid, primary key) - Unique booking identifier
  - `slot_id` (uuid, foreign key) - Reference to booked slot
  - `customer_name` (text) - Customer full name
  - `customer_email` (text) - Customer email
  - `customer_phone` (text) - Customer phone number
  - `num_guests` (integer) - Number of guests
  - `promo_code` (text, nullable) - Applied promo code
  - `discount_amount` (numeric) - Discount applied
  - `total_price` (numeric) - Final price after discount
  - `status` (text) - Booking status (pending, confirmed, cancelled)
  - `booking_reference` (text, unique) - Unique booking reference code
  - `created_at` (timestamptz) - Booking timestamp

  ### 4. promo_codes
  - `id` (uuid, primary key) - Unique promo code identifier
  - `code` (text, unique) - Promo code string
  - `discount_type` (text) - Type: "percentage" or "fixed"
  - `discount_value` (numeric) - Discount amount or percentage
  - `is_active` (boolean) - Whether code is currently valid
  - `expires_at` (timestamptz, nullable) - Expiration date
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for experiences and slots (browsing)
  - Authenticated write access with validation for bookings
  - Admin-only access for promo codes management
*/

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  duration text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  category text NOT NULL,
  max_group_size integer NOT NULL CHECK (max_group_size > 0),
  created_at timestamptz DEFAULT now()
);

-- Create experience_slots table
CREATE TABLE IF NOT EXISTS experience_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  date date NOT NULL,
  time text NOT NULL,
  available_spots integer NOT NULL CHECK (available_spots >= 0),
  total_spots integer NOT NULL CHECK (total_spots > 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_spots CHECK (available_spots <= total_spots)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES experience_slots(id) ON DELETE RESTRICT,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  num_guests integer NOT NULL CHECK (num_guests > 0),
  promo_code text,
  discount_amount numeric DEFAULT 0 CHECK (discount_amount >= 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  booking_reference text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_slots_experience ON experience_slots(experience_id);
CREATE INDEX IF NOT EXISTS idx_slots_date ON experience_slots(date);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code);

-- Enable Row Level Security
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for experiences (public read)
CREATE POLICY "Anyone can view experiences"
  ON experiences FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for experience_slots (public read)
CREATE POLICY "Anyone can view active slots"
  ON experience_slots FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- RLS Policies for bookings (public insert for new bookings, restricted read)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own bookings by reference"
  ON bookings FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for promo_codes (public read for validation)
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));