/*
  # Create automation and import orders tables

  1. New Tables
    - `reminders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `trigger_type` (text)
      - `trigger_value` (text)
      - `is_active` (boolean)
      - `last_triggered` (timestamp)
      - `times_triggered` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `email_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `subject` (text)
      - `content` (text)
      - `category` (text)
      - `times_used` (integer)
      - `times_sent` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sms_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `content` (text)
      - `category` (text)
      - `times_sent` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `imported_orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `order_number` (text)
      - `signer_name` (text)
      - `signer_phone` (text)
      - `signer_email` (text)
      - `appointment_date` (date)
      - `appointment_time` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `document_type` (text)
      - `fee` (decimal)
      - `mileage` (decimal)
      - `status` (text)
      - `source` (text)
      - `imported_at` (timestamp)
      - `notes` (text)
      - `special_instructions` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `integrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `is_connected` (boolean)
      - `last_sync` (timestamp)
      - `orders_imported` (integer)
      - `status` (text)
      - `features` (text array)
      - `setup_steps` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `email_notifications` (boolean)
      - `sms_notifications` (boolean)
      - `push_notifications` (boolean)
      - `appointment_reminders` (boolean)
      - `marketing_emails` (boolean)
      - `security_alerts` (boolean)
      - `profile_visibility` (text)
      - `data_sharing` (boolean)
      - `analytics_tracking` (boolean)
      - `theme` (text)
      - `language` (text)
      - `timezone` (text)
      - `date_format` (text)
      - `currency` (text)
      - `two_factor_enabled` (boolean)
      - `session_timeout` (integer)
      - `login_alerts` (boolean)
      - `default_fee` (decimal)
      - `auto_backup` (boolean)
      - `export_format` (text)
      - `invoice_template` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
*/

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  trigger_type text NOT NULL,
  trigger_value text NOT NULL,
  is_active boolean DEFAULT true,
  last_triggered timestamptz,
  times_triggered integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  times_used integer DEFAULT 0,
  times_sent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sms_templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  times_sent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create imported_orders table
CREATE TABLE IF NOT EXISTS imported_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text NOT NULL,
  signer_name text NOT NULL,
  signer_phone text,
  signer_email text,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  document_type text NOT NULL,
  fee decimal(10,2) NOT NULL,
  mileage decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending',
  source text NOT NULL,
  imported_at timestamptz DEFAULT now(),
  notes text,
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  is_connected boolean DEFAULT false,
  last_sync timestamptz,
  orders_imported integer DEFAULT 0,
  status text DEFAULT 'setup_required',
  features text[] DEFAULT '{}',
  setup_steps text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  push_notifications boolean DEFAULT true,
  appointment_reminders boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  security_alerts boolean DEFAULT true,
  profile_visibility text DEFAULT 'private',
  data_sharing boolean DEFAULT false,
  analytics_tracking boolean DEFAULT true,
  theme text DEFAULT 'system',
  language text DEFAULT 'en',
  timezone text DEFAULT 'America/Los_Angeles',
  date_format text DEFAULT 'MM/DD/YYYY',
  currency text DEFAULT 'USD',
  two_factor_enabled boolean DEFAULT false,
  session_timeout integer DEFAULT 30,
  login_alerts boolean DEFAULT true,
  default_fee decimal(10,2) DEFAULT 15.00,
  auto_backup boolean DEFAULT true,
  export_format text DEFAULT 'pdf',
  invoice_template text DEFAULT 'standard',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for reminders
CREATE POLICY "Users can manage own reminders"
  ON reminders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for email_templates
CREATE POLICY "Users can manage own email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for sms_templates
CREATE POLICY "Users can manage own sms templates"
  ON sms_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for imported_orders
CREATE POLICY "Users can manage own imported orders"
  ON imported_orders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for integrations
CREATE POLICY "Users can manage own integrations"
  ON integrations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_settings
CREATE POLICY "Users can manage own settings"
  ON user_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_templates_updated_at
  BEFORE UPDATE ON sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imported_orders_updated_at
  BEFORE UPDATE ON imported_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();