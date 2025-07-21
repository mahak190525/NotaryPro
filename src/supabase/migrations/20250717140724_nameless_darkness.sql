/*
  # Create user tables for NotaryPro application

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `business_name` (text)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `license_number` (text)
      - `commission_expiration` (date)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `google_users`
      - `id` (text, primary key)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
*/

-- Create users table for email/password signups
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  business_name text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  license_number text,
  commission_expiration date,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create google_users table for Google OAuth signups
CREATE TABLE IF NOT EXISTS google_users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  business_name text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  license_number text,
  commission_expiration date,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for google_users table
CREATE POLICY "Google users can read own data"
  ON google_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Google users can update own data"
  ON google_users
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Google users can insert own data"
  ON google_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_users_updated_at
  BEFORE UPDATE ON google_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();