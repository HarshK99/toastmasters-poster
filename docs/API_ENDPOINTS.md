# API Endpoints Documentation

## Overview
The Toastmasters voting system provides RESTful API endpoints for managing meetings and votes. All endpoints return JSON responses and use standard HTTP status codes.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

## Authentication
Currently uses simple email-based authentication. Admin users are identified by emails containing "admin".

---

## Meeting Endpoints

### 1. Create Meeting

Creates a new voting session with unique URL.

#### `POST /api/meetings/create`

##### Request Body
```json
{
  "name": "Weekly Meeting - December 2024",
  "date": "2024-12-15",
  "clubName": "Downtown Toastmasters",
  "createdBy": "admin@downtown-tm.com",
  "roles": [
    {
      "id": "best-speaker",
      "name": "Best Speaker",
      "nominees": [
        {
          "name": "Alice Johnson",
          "prefix": "TM"
        },
        {
          "name": "Bob Wilson",
          "prefix": "Guest"
        }
      ]
    },
    {
      "id": "best-evaluator",
      "name": "Best Evaluator",
      "nominees": [
        {
          "name": "Carol Davis",
          "prefix": "TM"
        }
      ]
    }
  ]
}
```

##### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Display name of the meeting |
| `date` | string | ✅ | Meeting date in YYYY-MM-DD format |
| `clubName` | string | ✅ | Name of the Toastmaster club |
| `createdBy` | string | ✅ | Email of the meeting creator |
| `roles` | array | ✅ | Array of voting roles |

##### Role Object Structure
```json
{
  "id": "unique-role-id",
  "name": "Role Display Name",
  "nominees": [
    {
      "name": "Nominee Full Name",
      "prefix": "TM" | "Guest"
    }
  ]
}
```

##### Success Response (201)
```json
{
  "meeting": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "weekly-meeting-downtown-toastmasters-abc123",
    "name": "Weekly Meeting - December 2024",
    "date": "2024-12-15",
    "club_name": "Downtown Toastmasters",
    "created_by": "admin@downtown-tm.com",
    "is_active": true,
    "roles": [...],
    "created_at": "2024-12-15T10:00:00.000Z",
    "updated_at": "2024-12-15T10:00:00.000Z"
  },
  "url": "http://localhost:3000/voting/weekly-meeting-downtown-toastmasters-abc123"
}
```

##### Error Responses
```json
// 400 - Bad Request
{
  "error": "Missing required fields"
}

// 500 - Server Error
{
  "error": "Failed to create meeting"
}
```

---

### 2. Get Meeting by Slug

Retrieves meeting information by unique slug.

#### `GET /api/meetings/[slug]`

##### URL Parameters
- `slug`: Unique meeting identifier (e.g., `weekly-meeting-downtown-tm-abc123`)

##### Success Response (200)
```json
{
  "meeting": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "weekly-meeting-downtown-toastmasters-abc123",
    "name": "Weekly Meeting - December 2024",
    "date": "2024-12-15",
    "club_name": "Downtown Toastmasters",
    "created_by": "admin@downtown-tm.com",
    "is_active": true,
    "roles": [
      {
        "id": "best-speaker",
        "name": "Best Speaker",
        "nominees": [
          {
            "name": "Alice Johnson",
            "prefix": "TM"
          },
          {
            "name": "Bob Wilson",
            "prefix": "Guest"
          }
        ]
      }
    ],
    "created_at": "2024-12-15T10:00:00.000Z",
    "updated_at": "2024-12-15T10:00:00.000Z"
  }
}
```

##### Error Responses
```json
// 400 - Bad Request
{
  "error": "Invalid slug"
}

// 404 - Not Found
{
  "error": "Meeting not found"
}

// 500 - Server Error
{
  "error": "Internal server error"
}
```

---

### 3. Update Meeting

Updates an existing meeting's information.

#### `PUT /api/meetings/update`

##### Request Body
```json
{
  "slug": "weekly-meeting-downtown-toastmasters-abc123",
  "name": "Updated Meeting Name",
  "date": "2024-12-16",
  "clubName": "Downtown Toastmasters",
  "roles": [
    {
      "id": "best-speaker",
      "name": "Best Speaker",
      "nominees": [
        {
          "name": "Alice Johnson",
          "prefix": "TM"
        },
        {
          "name": "New Nominee",
          "prefix": "Guest"
        }
      ]
    }
  ]
}
```

##### Success Response (200)
```json
{
  "meeting": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "weekly-meeting-downtown-toastmasters-abc123",
    "name": "Updated Meeting Name",
    "date": "2024-12-16",
    "club_name": "Downtown Toastmasters",
    "created_by": "admin@downtown-tm.com",
    "is_active": true,
    "roles": [...],
    "created_at": "2024-12-15T10:00:00.000Z",
    "updated_at": "2024-12-15T11:00:00.000Z"
  }
}
```

##### Error Responses
```json
// 400 - Bad Request
{
  "error": "Missing required fields"
}

// 404 - Not Found
{
  "error": "Meeting not found or update failed"
}

// 500 - Server Error
{
  "error": "Internal server error"
}
```

---

## Vote Endpoints

### 1. Submit Vote

Submits a vote for a specific role in a meeting.

#### `POST /api/votes/submit`

##### Request Body
```json
{
  "meetingSlug": "weekly-meeting-downtown-toastmasters-abc123",
  "roleId": "best-speaker",
  "nominee": {
    "name": "Alice Johnson",
    "prefix": "TM"
  },
  "voterEmail": "member@email.com",
  "voterName": "John Member"
}
```

##### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meetingSlug` | string | ✅ | Unique meeting identifier |
| `roleId` | string | ✅ | ID of the role being voted for |
| `nominee` | object | ✅ | Selected nominee information |
| `voterEmail` | string | ✅ | Email of the voter |
| `voterName` | string | ✅ | Name of the voter |

##### Nominee Object
```json
{
  "name": "Nominee Full Name",
  "prefix": "TM" | "Guest"
}
```

##### Success Response (201)
```json
{
  "vote": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "meeting_id": "123e4567-e89b-12d3-a456-426614174000",
    "role_id": "best-speaker",
    "nominee": {
      "name": "Alice Johnson",
      "prefix": "TM"
    },
    "voter_email": "member@email.com",
    "voter_name": "John Member",
    "created_at": "2024-12-15T10:30:00.000Z"
  }
}
```

##### Error Responses
```json
// 400 - Bad Request
{
  "error": "Missing required fields"
}

// 404 - Not Found
{
  "error": "Meeting not found"
}

// 409 - Conflict (if user already voted for this role)
{
  "error": "Vote already exists for this role"
}

// 500 - Server Error
{
  "error": "Failed to submit vote"
}
```

---

### 2. Get Voting Results

Retrieves voting results for a meeting.

#### `GET /api/votes/results?slug=[meetingSlug]`

##### Query Parameters
- `slug`: Unique meeting identifier

##### Success Response (200)
```json
{
  "meeting": {
    "name": "Weekly Meeting - December 2024",
    "date": "2024-12-15",
    "clubName": "Downtown Toastmasters"
  },
  "results": [
    {
      "roleId": "best-speaker",
      "roleName": "Best Speaker",
      "totalVotes": 5,
      "results": [
        {
          "nominee": "TM Alice Johnson",
          "count": 3
        },
        {
          "nominee": "Guest Bob Wilson",
          "count": 2
        }
      ],
      "voters": [
        {
          "name": "John Member",
          "email": "member1@email.com"
        },
        {
          "name": "Jane Member", 
          "email": "member2@email.com"
        }
      ]
    },
    {
      "roleId": "best-evaluator",
      "roleName": "Best Evaluator",
      "totalVotes": 3,
      "results": [
        {
          "nominee": "TM Carol Davis",
          "count": 3
        }
      ],
      "voters": [
        {
          "name": "John Member",
          "email": "member1@email.com"
        }
      ]
    }
  ]
}
```

##### Response Structure

**Meeting Object**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Meeting display name |
| `date` | string | Meeting date |
| `clubName` | string | Club name |

**Results Array**
| Field | Type | Description |
|-------|------|-------------|
| `roleId` | string | Unique role identifier |
| `roleName` | string | Role display name |
| `totalVotes` | number | Total votes for this role |
| `results` | array | Vote counts by nominee |
| `voters` | array | List of people who voted |

**Results Item**
| Field | Type | Description |
|-------|------|-------------|
| `nominee` | string | Formatted nominee name (e.g., "TM Alice Johnson") |
| `count` | number | Number of votes received |

**Voter Item**
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Voter's name |
| `email` | string | Voter's email |

##### Error Responses
```json
// 400 - Bad Request
{
  "error": "Invalid slug"
}

// 404 - Not Found
{
  "error": "Meeting not found"
}

// 500 - Server Error
{
  "error": "Internal server error"
}
```

---

## Error Handling

### HTTP Status Codes
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `405` - Method Not Allowed (wrong HTTP method)
- `409` - Conflict (duplicate vote)
- `500` - Internal Server Error

### Error Response Format
All error responses follow this format:
```json
{
  "error": "Human-readable error message"
}
```

---

## Rate Limiting
Currently no rate limiting is implemented. For production deployment, consider implementing:
- Rate limiting per IP address
- Vote submission throttling
- Meeting creation limits per user

---

## CORS Configuration
API endpoints support cross-origin requests for frontend integration.

---

## Testing Examples

### cURL Examples

#### Create Meeting
```bash
curl -X POST http://localhost:3000/api/meetings/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Meeting",
    "date": "2024-12-15",
    "clubName": "Test Club",
    "createdBy": "admin@test.com",
    "roles": [
      {
        "id": "test-role",
        "name": "Test Role",
        "nominees": [
          {"name": "Test User", "prefix": "TM"}
        ]
      }
    ]
  }'
```

#### Submit Vote
```bash
curl -X POST http://localhost:3000/api/votes/submit \
  -H "Content-Type: application/json" \
  -d '{
    "meetingSlug": "test-meeting-test-club-abc123",
    "roleId": "test-role",
    "nominee": {"name": "Test User", "prefix": "TM"},
    "voterEmail": "voter@test.com",
    "voterName": "Test Voter"
  }'
```

#### Get Results
```bash
curl "http://localhost:3000/api/votes/results?slug=test-meeting-test-club-abc123"
```

---

## Security Considerations

### Input Validation
- All endpoints validate required fields
- Email format validation
- Slug format validation (alphanumeric and hyphens only)

### SQL Injection Prevention
- Using parameterized queries via Supabase client
- JSONB data properly escaped

### Data Privacy
- Voter information stored but results anonymized
- Row Level Security policies in database

### Production Recommendations
1. Implement proper authentication/authorization
2. Add request rate limiting
3. Input sanitization and validation
4. HTTPS enforcement
5. CORS configuration for specific domains