# Admin Test Credentials

## Dummy Admin Access

For testing and development purposes, you can use these hardcoded admin credentials:

**Email:** `admin@test.com`  
**Password:** `admin123`

## How to Use

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/voting`
3. Login with the dummy credentials above
4. You'll be granted admin access to create voting sessions

## Security Note

⚠️ **Important**: These are dummy credentials for development only. In production:
- Remove the hardcoded bypass from `/pages/api/auth/login.ts`
- Create real admin users in the database
- Use strong, unique passwords
- Consider implementing additional security measures

## Production Setup

To create real admin users, use the registration endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "youradmin@email.com",
    "password": "your-secure-password",
    "role": "admin"
  }'
```

Or set up your Supabase database with admin users directly.