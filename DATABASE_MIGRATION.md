# Database Migration Guide

## Overview
The voting system has been upgraded to support multiple clubs and cross-device functionality using a PostgreSQL database via Supabase.

## Key Changes
- **Unique URLs**: Each meeting now has a unique URL (e.g., `/voting/weekly-meeting-downtown-tm-abc123`)
- **Cross-device support**: Votes persist across devices and browsers
- **Multi-club support**: Different clubs can run simultaneous voting sessions
- **Real-time updates**: Results update in real-time as votes are submitted

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready (usually 2-3 minutes)

### 2. Set Up Database Schema
1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Run the query to create tables and policies

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
3. Get these values from your Supabase project settings

### 4. Install Dependencies
```bash
npm install
```

## New Workflow

### For Admins
1. Go to `/voting` and login with an admin email (containing "admin")
2. Create a meeting with club name and details
3. Add roles and nominees
4. Get a unique shareable URL (e.g., `/voting/weekly-meeting-downtown-tm-abc123`)
5. Share this URL with members

### For Members
1. Visit the unique meeting URL shared by admin
2. Login with name and email
3. Vote for each role
4. Submit votes (persisted to database)

### For Results
1. Admins can view real-time results
2. Results show vote counts and percentages
3. Progressive reveal functionality for dramatic effect

## Architecture Benefits

### Cross-Device Support
- Members can start voting on mobile, finish on desktop
- No data loss between devices
- Real-time synchronization

### Multi-Club Support
- Each club gets unique meeting URLs
- No interference between different clubs
- Centralized system for multiple organizations

### Scalability
- Database handles concurrent users
- Real-time updates via Supabase
- Production-ready infrastructure

### Security
- Row Level Security (RLS) policies
- Public read access only to active meetings
- Voter anonymity maintained

## Migration Path
The system maintains backward compatibility with localStorage for development/demo purposes. The database approach is recommended for production use.

## Production Deployment
1. Set `NEXT_PUBLIC_BASE_URL` to your domain
2. Configure Supabase for production
3. Set up proper authentication (optional)
4. Enable RLS policies for security

## Troubleshooting
- Ensure Supabase credentials are correct in `.env.local`
- Check that database schema was applied successfully
- Verify network connectivity to Supabase
- Check browser console for API errors