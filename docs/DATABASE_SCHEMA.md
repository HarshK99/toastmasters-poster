# Database Schema Documentation

## Overview
The Toastmasters voting system uses PostgreSQL via Supabase with two main tables: `meetings` and `votes`. The schema supports multi-club operations, unique meeting URLs, and real-time voting functionality.

## Tables

### 1. `meetings` Table

Stores voting session information for different Toastmaster clubs.

#### Schema
```sql
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
```

#### Field Descriptions

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Primary key, auto-generated | PRIMARY KEY |
| `slug` | TEXT | Unique URL identifier for the meeting | UNIQUE, NOT NULL |
| `name` | TEXT | Meeting display name | NOT NULL |
| `date` | DATE | Date of the meeting | NOT NULL |
| `club_name` | TEXT | Name of the Toastmaster club | NOT NULL |
| `created_by` | TEXT | Email/identifier of meeting creator | NOT NULL |
| `is_active` | BOOLEAN | Whether the meeting is active for voting | DEFAULT true |
| `roles` | JSONB | Array of voting roles and nominees | NOT NULL, DEFAULT '[]' |
| `created_at` | TIMESTAMP | When the meeting was created | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | When the meeting was last updated | DEFAULT NOW() |

#### `roles` JSONB Structure
```json
[
  {
    "id": "role-12345",
    "name": "Best Speaker",
    "nominees": [
      {
        "name": "John Doe",
        "prefix": "TM"
      },
      {
        "name": "Jane Smith", 
        "prefix": "Guest"
      }
    ]
  }
]
```

#### Indexes
```sql
CREATE INDEX idx_meetings_slug ON meetings(slug);
CREATE INDEX idx_meetings_club ON meetings(club_name);
```

#### Example Data
```sql
INSERT INTO meetings (slug, name, date, club_name, created_by, roles) VALUES (
  'weekly-meeting-downtown-tm-abc123',
  'Weekly Meeting - December 2024',
  '2024-12-15',
  'Downtown Toastmasters',
  'admin@downtown-tm.com',
  '[
    {
      "id": "best-speaker",
      "name": "Best Speaker",
      "nominees": [
        {"name": "Alice Johnson", "prefix": "TM"},
        {"name": "Bob Wilson", "prefix": "Guest"}
      ]
    }
  ]'::jsonb
);
```

---

### 2. `votes` Table

Stores individual votes submitted by members for each role in a meeting.

#### Schema
```sql
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
```

#### Field Descriptions

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | UUID | Primary key, auto-generated | PRIMARY KEY |
| `meeting_id` | UUID | Reference to the meeting | FOREIGN KEY, CASCADE DELETE |
| `role_id` | TEXT | ID of the role being voted for | NOT NULL |
| `nominee` | JSONB | The selected nominee information | NOT NULL |
| `voter_email` | TEXT | Email of the person voting | NOT NULL |
| `voter_name` | TEXT | Name of the person voting | NOT NULL |
| `created_at` | TIMESTAMP | When the vote was submitted | DEFAULT NOW() |

#### Unique Constraint
```sql
UNIQUE(meeting_id, role_id, voter_email)
```
Ensures each voter can only vote once per role per meeting.

#### `nominee` JSONB Structure
```json
{
  "name": "Alice Johnson",
  "prefix": "TM"
}
```

#### Indexes
```sql
CREATE INDEX idx_votes_meeting ON votes(meeting_id);
CREATE INDEX idx_votes_voter ON votes(voter_email);
```

#### Example Data
```sql
INSERT INTO votes (meeting_id, role_id, nominee, voter_email, voter_name) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'best-speaker',
  '{"name": "Alice Johnson", "prefix": "TM"}'::jsonb,
  'member@email.com',
  'Member Name'
);
```

---

## Row Level Security (RLS)

### Security Policies

#### Meetings Table Policies
```sql
-- Allow public read access to active meetings
CREATE POLICY "Allow public read on active meetings" ON meetings
  FOR SELECT USING (is_active = true);

-- Allow insert/update for meetings
CREATE POLICY "Allow insert on meetings" ON meetings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on meetings" ON meetings
  FOR UPDATE USING (true);
```

#### Votes Table Policies
```sql
-- Allow public insert/read on votes
CREATE POLICY "Allow insert on votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read on votes" ON votes
  FOR SELECT USING (true);
```

---

## Database Functions

### Slug Generation
The application generates unique slugs using this logic:
```typescript
const generateSlug = (meetingName: string, clubName: string): string => {
  const slug = `${meetingName}-${clubName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${slug}-${randomSuffix}`
}
```

---

## Data Relationships

```
meetings (1) ←→ (many) votes
   ↓
meetings.id = votes.meeting_id

One meeting can have many votes
Each vote belongs to exactly one meeting
Votes are deleted when meeting is deleted (CASCADE)
```

---

## Query Examples

### Get meeting with all votes
```sql
SELECT 
  m.*,
  json_agg(
    json_build_object(
      'role_id', v.role_id,
      'nominee', v.nominee,
      'voter_email', v.voter_email,
      'voter_name', v.voter_name
    )
  ) as votes
FROM meetings m
LEFT JOIN votes v ON m.id = v.meeting_id
WHERE m.slug = 'meeting-slug-here'
  AND m.is_active = true
GROUP BY m.id;
```

### Get vote counts by role
```sql
SELECT 
  v.role_id,
  v.nominee->>'name' as nominee_name,
  v.nominee->>'prefix' as nominee_prefix,
  COUNT(*) as vote_count
FROM votes v
JOIN meetings m ON v.meeting_id = m.id
WHERE m.slug = 'meeting-slug-here'
GROUP BY v.role_id, v.nominee->>'name', v.nominee->>'prefix'
ORDER BY v.role_id, vote_count DESC;
```

### Check if user has voted for a role
```sql
SELECT EXISTS(
  SELECT 1 FROM votes v
  JOIN meetings m ON v.meeting_id = m.id
  WHERE m.slug = 'meeting-slug-here'
    AND v.role_id = 'role-id-here'
    AND v.voter_email = 'voter@email.com'
);
```

---

## Backup and Maintenance

### Regular Backups
```sql
-- Export meetings
COPY meetings TO '/path/to/meetings_backup.csv' DELIMITER ',' CSV HEADER;

-- Export votes
COPY votes TO '/path/to/votes_backup.csv' DELIMITER ',' CSV HEADER;
```

### Cleanup Old Meetings
```sql
-- Disable meetings older than 6 months
UPDATE meetings 
SET is_active = false 
WHERE created_at < NOW() - INTERVAL '6 months';

-- Delete votes for inactive meetings (optional)
DELETE FROM votes 
WHERE meeting_id IN (
  SELECT id FROM meetings WHERE is_active = false
);
```

---

## Performance Considerations

1. **Indexing**: Ensure indexes on `slug`, `club_name`, `meeting_id`, and `voter_email`
2. **JSONB Operations**: Use GIN indexes for complex JSONB queries if needed
3. **Connection Pooling**: Use Supabase connection pooling for high traffic
4. **Query Optimization**: Use `SELECT` specific fields instead of `*` in production

---

## Migration Scripts

### Initial Setup
```sql
-- Run this in Supabase SQL Editor
-- 1. Create tables
\i database/schema.sql

-- 2. Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('meetings', 'votes');

-- 3. Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename IN ('meetings', 'votes');
```