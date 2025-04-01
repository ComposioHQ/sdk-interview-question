-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'invited',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0
);

-- Releases table
CREATE TABLE IF NOT EXISTS releases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tag_name TEXT NOT NULL,
  name TEXT NOT NULL,
  download_url TEXT NOT NULL,
  zip_asset_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_candidates_token ON candidates(token);

-- Create index for releases by creation date
CREATE INDEX IF NOT EXISTS idx_releases_created_at ON releases(created_at DESC);

-- Function to increment a column in any table
CREATE OR REPLACE FUNCTION increment(row_id UUID, tab text, col text)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  result integer;
BEGIN
  EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1 RETURNING %I', tab, col, col, col)
  INTO result
  USING row_id;
  
  RETURN result;
END;
$$;