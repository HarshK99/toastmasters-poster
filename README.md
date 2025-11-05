# Toastmaster Voting System

This is a [Next.js](https://nextjs.org) project for multi-club cross-device Toastmaster voting with secure admin authentication.

## 🚀 Quick Start

### 1. Start Development Server

```bash
npm run dev
```

### 2. Access Admin Dashboard

Open [http://localhost:3000/voting](http://localhost:3000/voting) and login with:

**Email:** `admin@test.com`  
**Password:** `admin123`

### 3. Create Voting Session

1. Login as admin
2. Create a new meeting with club details
3. Add roles and nominees
4. Share the unique meeting URL with club members

## 🎯 Features

- **Secure Admin Authentication** with database-backed user management
- **Multi-club Support** with unique meeting URLs
- **Cross-device Voting** - start on phone, finish on desktop
- **Real-time Results** with live vote counting
- **Production Ready** with PostgreSQL/Supabase backend

## 📋 Setup Guide

For detailed setup instructions, see:
- `IMPLEMENTATION_SUMMARY.md` - Full feature overview
- `ADMIN_CREDENTIALS.md` - Test credentials and security notes
- `docs/DATABASE_SCHEMA.md` - Database structure

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
