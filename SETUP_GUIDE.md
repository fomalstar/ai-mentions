# 🚀 AI Keyword Tool Setup Guide

## Quick Start

The AI Keyword Tool is now enhanced with demo mode, so you can test it immediately without a database! However, to get the full functionality with data persistence, follow this setup guide.

## Option 1: Test Without Database (Demo Mode) ✅

You can test the app immediately without any setup:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the test page:**
   - Go to `http://localhost:3000/test`
   - Enter any keyword to test the AI analysis
   - All features work with mock data

3. **Try the dashboard:**
   - Go to `http://localhost:3000/dashboard`
   - Sign in (OAuth will work in demo mode)
   - Analyze keywords and see results

## Option 2: Full Setup with Database

### Step 1: Install PostgreSQL

#### Option A: Download PostgreSQL
1. Go to [PostgreSQL Downloads](https://www.postgresql.org/download/)
2. Download and install PostgreSQL for your OS
3. Remember the password you set for the `postgres` user

#### Option B: Use Docker (Recommended)
```bash
# Install Docker Desktop first, then run:
docker run --name aimentions-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=aimentions -p 5432:5432 -d postgres:15
```

### Step 2: Create Environment File

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/aimentions"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# DataForSEO API (already configured)
DATAFORSEO_LOGIN="yavor@effectivemarketer.com"
DATAFORSEO_PASSWORD="9b8140d8b2d8b2dff367"

# OAuth Providers (optional for now)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
```

### Step 3: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Set up test data
npm run db:setup
```

### Step 4: Start the Application

```bash
npm run dev
```

### Step 5: Test the Application

1. **Test Page:** `http://localhost:3000/test`
2. **Dashboard:** `http://localhost:3000/dashboard`
3. **Homepage:** `http://localhost:3000`

## Features Available

### ✅ Working Now (Demo Mode)
- **AI Keyword Analysis** - Real DataForSEO integration
- **Brand Mention Detection** - Sentiment analysis
- **Trend Visualization** - Monthly data charts
- **Related Keywords** - AI-generated suggestions
- **Beautiful UI** - Aurora animations and modern design

### 🔄 Available with Database
- **User Authentication** - OAuth sign-in
- **Data Persistence** - Save your keyword analyses
- **Token Management** - Track usage and limits
- **User Dashboard** - Personal analytics

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
psql --version

# Test connection
psql -h localhost -U postgres -d aimentions

# If using Docker, check container status
docker ps
```

### Environment Variables
- Make sure `.env.local` is in the project root
- Restart the development server after creating the file
- Check that the DATABASE_URL is correct

### OAuth Issues
- OAuth providers are optional for demo mode
- The app works without OAuth setup
- Set up OAuth only when you want user authentication

## Next Steps

Once the database is set up:

1. **Set up OAuth providers** (Google/GitHub)
2. **Configure production environment**
3. **Deploy to hosting platform**
4. **Set up monitoring and analytics**

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure PostgreSQL is running and accessible
4. Try the demo mode first to verify the app works

---

**Current Status:** ✅ Demo mode working, ready for database setup
