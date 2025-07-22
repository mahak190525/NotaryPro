/*
  # Add uuid_id column to google_users table

  1. Changes
    - Add `uuid_id` column to `google_users` table as foreign key to `users.id`
    - Create trigger function to automatically create corresponding user record
    - Create trigger to execute function on insert

  2. Security
    - Maintain existing RLS policies
*/

-- Add uuid_id column to google_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'google_users' AND column_name = 'uuid_id'
  ) THEN
    ALTER TABLE google_users ADD COLUMN uuid_id uuid;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'google_users_uuid_id_fkey'
  ) THEN
    ALTER TABLE google_users
    ADD CONSTRAINT google_users_uuid_id_fkey
    FOREIGN KEY (uuid_id)
    REFERENCES users(id);
  END IF;
END $$;

-- Create function to handle google user insert
CREATE OR REPLACE FUNCTION handle_google_user_insert()
RETURNS TRIGGER AS $$
DECLARE
  new_uuid uuid := gen_random_uuid();
BEGIN
  -- Insert into users table
  INSERT INTO users (
    id, email, first_name, last_name, avatar_url, business_name
  ) VALUES (
    new_uuid,
    NEW.email,
    NEW.first_name,
    NEW.last_name,
    NEW.avatar_url,
    NEW.business_name
  );

  -- Set the foreign key in google_users
  NEW.uuid_id := new_uuid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'before_insert_google_user'
  ) THEN
    CREATE TRIGGER before_insert_google_user
    BEFORE INSERT ON google_users
    FOR EACH ROW
    EXECUTE FUNCTION handle_google_user_insert();
  END IF;
END $$;