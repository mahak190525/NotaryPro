/*
  # Create application tables for NotaryPro

  1. New Tables
    - `receipts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `vendor` (text)
      - `amount` (decimal)
      - `category` (text)
      - `description` (text)
      - `payment_method` (text)
      - `tax_deductible` (boolean)
      - `image_url` (text)
      - `ocr_processed` (boolean)
      - `status` (text)
      - `tags` (text array)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `time` (text)
      - `client_name` (text)
      - `client_id` (text)
      - `appointment_type` (text)
      - `document_type` (text)
      - `notary_fee` (decimal)
      - `location` (text)
      - `witness_required` (boolean)
      - `witness_name` (text)
      - `signature` (text)
      - `thumbprint` (text)
      - `id_verified` (boolean)
      - `id_type` (text)
      - `id_number` (text)
      - `id_expiration` (date)
      - `notes` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `mileage_trips`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `start_location` (text)
      - `end_location` (text)
      - `distance` (decimal)
      - `date` (date)
      - `purpose` (text)
      - `category` (text)
      - `rate` (decimal)
      - `amount` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  vendor text NOT NULL,
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  payment_method text NOT NULL DEFAULT 'Credit Card',
  tax_deductible boolean DEFAULT true,
  image_url text,
  ocr_processed boolean DEFAULT false,
  status text DEFAULT 'pending',
  tags text[] DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  time text NOT NULL,
  client_name text NOT NULL,
  client_id text,
  appointment_type text DEFAULT 'in-person',
  document_type text NOT NULL,
  notary_fee decimal(10,2) NOT NULL,
  location text NOT NULL,
  witness_required boolean DEFAULT false,
  witness_name text,
  signature text,
  thumbprint text,
  id_verified boolean DEFAULT false,
  id_type text NOT NULL,
  id_number text NOT NULL,
  id_expiration date,
  notes text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mileage_trips table
CREATE TABLE IF NOT EXISTS mileage_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  start_location text NOT NULL,
  end_location text NOT NULL,
  distance decimal(10,2) NOT NULL,
  date date NOT NULL,
  purpose text NOT NULL,
  category text NOT NULL DEFAULT 'business',
  rate decimal(10,2) NOT NULL DEFAULT 0.70,
  amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_trips ENABLE ROW LEVEL SECURITY;

-- Create policies for receipts
CREATE POLICY "Users can read own receipts"
  ON receipts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON receipts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for journal_entries
CREATE POLICY "Users can read own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for mileage_trips
CREATE POLICY "Users can read own mileage trips"
  ON mileage_trips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mileage trips"
  ON mileage_trips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mileage trips"
  ON mileage_trips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mileage trips"
  ON mileage_trips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mileage_trips_updated_at
  BEFORE UPDATE ON mileage_trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();