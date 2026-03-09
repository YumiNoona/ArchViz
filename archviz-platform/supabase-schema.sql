-- ArchViz Studio — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Create the visitors table
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact TEXT NOT NULL,
  project TEXT NOT NULL,
  project_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (visitors submitting the form)
CREATE POLICY "Allow anonymous inserts" ON visitors
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow service role to read all rows (for your admin dashboard)
CREATE POLICY "Allow service role reads" ON visitors
  FOR SELECT TO service_role
  USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_visitors_project_id ON visitors(project_id);
CREATE INDEX IF NOT EXISTS idx_visitors_timestamp ON visitors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON visitors(email);

-- Optional: View for analytics
CREATE OR REPLACE VIEW visitor_analytics AS
  SELECT
    project,
    project_id,
    COUNT(*) as total_visits,
    COUNT(DISTINCT email) as unique_visitors,
    MIN(timestamp) as first_visit,
    MAX(timestamp) as last_visit
  FROM visitors
  GROUP BY project, project_id
  ORDER BY total_visits DESC;
