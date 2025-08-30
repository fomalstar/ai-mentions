# 🚀 Render Deployment Guide with PostgreSQL

## Overview

This guide will help you deploy your AI Mentions app to Render with a PostgreSQL database.

## Prerequisites

- GitHub repository with your code
- Render account
- OpenAI API key
- OAuth credentials (Google/GitHub)

## Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 1.2 Verify Required Files

Make sure these files are in your repository:
- ✅ `render.yaml` - Render configuration
- ✅ `package.json` - Dependencies and scripts
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `scripts/migrate.js` - Database migration script

## Step 2: Create Render PostgreSQL Database

### 2.1 Create Database Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `aimentions-db`
   - **Database**: `aimentions_db`
   - **User**: `aimentions_user`
   - **Plan**: Starter (Free tier)
4. Click "Create Database"

### 2.2 Note Database Details

After creation, note:
- **Internal Database URL**: `postgresql://aimentions_user:password@host:port/aimentions_db`
- **External Database URL**: For local development (if needed)

## Step 3: Create Web Service

### 3.1 Connect Repository

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Render will auto-detect the `render.yaml` configuration

### 3.2 Configure Environment Variables

Add these environment variables in Render dashboard:

```bash
# Required
NODE_ENV=production
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-app-name.onrender.com
OPENAI_API_KEY=sk-proj-your-openai-api-key

# OAuth (Add when ready)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Stripe (Add when ready)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3.3 Link Database

1. In your web service settings
2. Go to "Environment" tab
3. Add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Select from database service
   - Choose the internal database URL

## Step 4: Deploy and Monitor

### 4.1 Initial Deployment

1. Click "Create Web Service"
2. Render will:
   - Install dependencies
   - Run database migrations (`npm run db:deploy`)
   - Build the application
   - Start the service

### 4.2 Monitor Build Process

Watch the build logs for:
- ✅ Database connection successful
- ✅ Schema pushed successfully
- ✅ Prisma client generated
- ✅ Initial data created
- ✅ Build completed

### 4.3 Verify Deployment

1. Visit your app URL
2. Test the health endpoint: `/api/health`
3. Should return: `{"status":"healthy","database":"connected"}`

## Step 5: OAuth Setup

### 5.1 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `https://your-app-name.onrender.com/api/auth/callback/google`

### 5.2 GitHub OAuth

1. Go to [GitHub Settings > OAuth Apps](https://github.com/settings/developers)
2. Create new OAuth App
3. Add callback URLs:
   - `https://your-app-name.onrender.com/api/auth/callback/github`

### 5.3 Update Environment Variables

Add the OAuth credentials to your Render environment variables.

## Step 6: Testing

### 6.1 Test Database Connection

Visit `/api/health` - should show database connected.

### 6.2 Test AI Keyword Research

1. Visit your app
2. Try the keyword research feature
3. Verify AI queries are generated

### 6.3 Test Topic Tracking

1. Sign in (if OAuth is configured)
2. Add a topic to track
3. Verify it's saved to the database

## Troubleshooting

### Common Issues

#### Database Connection Failed
- Check `DATABASE_URL` environment variable
- Verify database service is running
- Check firewall settings

#### Migration Failed
- Check build logs for Prisma errors
- Verify schema.prisma is valid
- Check database permissions

#### OAuth Errors
- Verify callback URLs match exactly
- Check client ID/secret
- Ensure OAuth apps are properly configured

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for TypeScript errors

### Useful Commands

```bash
# Check database connection
curl https://your-app.onrender.com/api/health

# View build logs
# Check Render dashboard → Your Service → Logs

# Test locally with production database
DATABASE_URL="your-external-database-url" npm run dev
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random string for session encryption |
| `NEXTAUTH_URL` | ✅ | Your app's public URL |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for AI features |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth client secret |
| `GITHUB_ID` | ❌ | GitHub OAuth app ID |
| `GITHUB_SECRET` | ❌ | GitHub OAuth app secret |

## Next Steps

After successful deployment:

1. **Set up monitoring**: Configure error tracking
2. **Add custom domain**: Configure DNS settings
3. **Set up SSL**: Automatic with Render
4. **Configure backups**: Database backup strategy
5. **Set up alerts**: Monitor service health

## Support

- [Render Documentation](https://render.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth Documentation](https://next-auth.js.org/)

---

**Status**: Ready for deployment 🚀
