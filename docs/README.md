# Documentation Index

## 📚 Toastmasters Voting System Documentation

This folder contains comprehensive documentation for the Toastmasters voting system, covering database architecture, API endpoints, and implementation details.

## 📋 Documentation Files

### 1. [Database Schema](./DATABASE_SCHEMA.md) 
**Complete database documentation including:**
- Table structures (`meetings`, `votes`)
- Field descriptions and constraints
- JSONB data structures for roles and nominees
- Row Level Security (RLS) policies
- Indexes and performance optimization
- Query examples and migration scripts

### 2. [API Endpoints](./API_ENDPOINTS.md)
**Comprehensive API reference including:**
- All REST endpoints with HTTP methods
- Request/response examples with full JSON
- Error handling and status codes
- Field validation and constraints
- cURL examples for testing
- Security considerations

## 🎯 Quick Reference

### Database Tables
- **`meetings`** - Voting sessions with unique slugs and roles
- **`votes`** - Individual vote records with constraints

### Core API Endpoints
- `POST /api/meetings/create` - Create new voting session
- `GET /api/meetings/[slug]` - Get meeting by unique URL
- `PUT /api/meetings/update` - Update meeting details
- `POST /api/votes/submit` - Submit individual votes
- `GET /api/votes/results` - Get real-time voting results

### Key Features
- **Multi-club support** with unique URLs per meeting
- **Cross-device voting** with real-time persistence
- **Anonymous voting** with voter tracking
- **Real-time results** with progressive reveal
- **Admin dashboard** for meeting management

## 🔗 Related Files

### Implementation Files
- `database/schema.sql` - Complete database setup script
- `lib/database.ts` - Database client and utility functions
- `types/voting.ts` - TypeScript type definitions

### Setup Guides
- `DATABASE_MIGRATION.md` - Migration and setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Feature overview and benefits
- `.env.example` - Environment variable template

## 🚀 Getting Started

1. **Database Setup**: Follow `DATABASE_SCHEMA.md` to set up Supabase
2. **API Reference**: Use `API_ENDPOINTS.md` for integration
3. **Environment**: Configure using `.env.example`
4. **Migration**: Follow `DATABASE_MIGRATION.md` for deployment

## 🛠 For Developers

### TypeScript Types
All database schemas have corresponding TypeScript interfaces in `types/voting.ts`:
- `Meeting` - Meeting structure
- `Vote` - Vote record structure
- `VotingRole` - Role with nominees
- `Nominee` - Individual nominee
- `VoteResults` - Aggregated results
- `User` - User information

### Testing
Use the cURL examples in `API_ENDPOINTS.md` to test all endpoints during development.

### Production Deployment
Refer to both documentation files for:
- Database security policies
- API rate limiting considerations
- Environment configuration
- Performance optimization

---

📖 **Note**: These documentation files are kept up-to-date with the implementation. Always refer to the latest version when integrating or deploying the system.