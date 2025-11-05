-- Supabase SQL Schema
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  club_name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  roles JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL,
  nominee JSONB NOT NULL,
  voter_email TEXT NOT NULL,
  voter_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one vote per role per voter per meeting
  UNIQUE(meeting_id, role_id, voter_email)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_meetings_slug ON meetings(slug);
CREATE INDEX idx_meetings_club ON meetings(club_name);
CREATE INDEX idx_votes_meeting ON votes(meeting_id);
CREATE INDEX idx_votes_voter ON votes(voter_email);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to users for authentication
CREATE POLICY "Allow public read on users" ON users
  FOR SELECT USING (true);

-- Allow insert for user registration (in production, you'd want proper validation)
CREATE POLICY "Allow insert on users" ON users
  FOR INSERT WITH CHECK (true);

-- Allow public read access to active meetings
CREATE POLICY "Allow public read on active meetings" ON meetings
  FOR SELECT USING (is_active = true);

-- Allow insert/update for meetings (in production, you'd want proper auth)
CREATE POLICY "Allow insert on meetings" ON meetings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on meetings" ON meetings
  FOR UPDATE USING (true);

-- Allow public insert/read on votes
CREATE POLICY "Allow insert on votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read on votes" ON votes
  FOR SELECT USING (true);