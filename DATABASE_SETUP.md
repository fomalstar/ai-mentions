# 🗄️ Database Setup Guide

## Local Development Setup

### 1. Create `.env.local` File

Create a `.env.local` file in your project root with the following content:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/aimentions_db"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI Configuration
OPENAI_API_KEY="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"

# OAuth Providers (Add these when you create the apps)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
# GITHUB_ID="your-github-client-id"
# GITHUB_SECRET="your-github-client-secret"

# Stripe Configuration (Add when ready)
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_PUBLISHABLE_KEY="pk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis Configuration (Add when ready)
# UPSTASH_REDIS_REST_URL="https://..."
# UPSTASH_REDIS_REST_TOKEN="..."
```

### 2. Install PostgreSQL

#### Option A: Install PostgreSQL Locally
1. Download from [postgresql.org](https://www.postgresql.org/download/)
2. Install with default settings
3. Remember the password you set for the `postgres` user

#### Option B: Use Docker (Recommended for development)
```bash
docker run --name postgres-aimentions -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=aimentions_db -p 5432:5432 -d postgres:15
```

### 3. Create Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE aimentions_db;

# Exit
\q
```

### 4. Update DATABASE_URL

Update your `.env.local` with the correct credentials:

```bash
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/aimentions_db"
```

### 5. Run Database Migration

```bash
npx prisma db push
npx prisma generate
```

### 6. Create Test User

```bash
npm run db:setup
```

## Render Deployment Setup

### 1. Create Render PostgreSQL Database

1. Go to [render.com](https://render.com)
2. Create a new PostgreSQL database
3. Note the connection details

### 2. Update Environment Variables on Render

Add these environment variables to your Render service:

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-production-secret-key"
NEXTAUTH_URL="https://your-app-name.onrender.com"
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Deploy Database Schema

The database schema will be automatically created when your app first connects.

## OAuth Setup

### 1. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app-name.onrender.com/api/auth/callback/google`

### 2. GitHub OAuth

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Create new OAuth App
3. Add callback URLs:
   - Local: `http://localhost:3000/api/auth/callback/github`
   - Production: `https://your-app-name.onrender.com/api/auth/callback/github`

## Stripe Setup

### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard

### 2. Add to Environment Variables

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Testing the Setup

### 1. Test Database Connection

```bash
npm run dev
```

Visit `/api/health` - should return `{"status":"healthy","database":"connected"}`

### 2. Test Authentication

1. Visit `/dashboard`
2. Click "Sign In"
3. Test OAuth providers

### 3. Test AI Keyword Research

1. Visit `/test` or `/dashboard`
2. Enter a keyword
3. Verify AI queries are generated

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check firewall settings

2. **OAuth Errors**
   - Verify callback URLs match exactly
   - Check client ID/secret
   - Ensure OAuth apps are properly configured

3. **Prisma Errors**
   - Run `npx prisma generate` after schema changes
   - Check database connection
   - Verify environment variables

### Support

- Check [Prisma docs](https://www.prisma.io/docs/)
- Check [NextAuth docs](https://next-auth.js.org/)
- Check [Render docs](https://render.com/docs)
