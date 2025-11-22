-- Add pincode column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);

-- Add index for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_pincode ON profiles(pincode);
