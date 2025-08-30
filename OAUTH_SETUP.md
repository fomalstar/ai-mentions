# 🔐 OAuth Authentication Setup Guide

## Overview

This guide will help you set up OAuth authentication with Google and GitHub for your AI Mentions app. This enables users to sign in securely using their existing accounts.

## Prerequisites

- Google Cloud Console account
- GitHub account
- Your app deployed or running locally

## Step 1: Google OAuth Setup

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `aimentions-app`
4. Click **"Create"**

### 1.2 Enable Google+ API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and press **"Enable"**

### 1.3 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Configure the OAuth consent screen:
   - **User Type**: External
   - **App name**: Aimentions
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - **Authorized domains**: Add your domain (e.g., `aimentions.com`)

4. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Name**: Aimentions Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-domain.com/api/auth/callback/google` (for production)

5. Click **"Create"** and note your **Client ID** and **Client Secret**

## Step 2: GitHub OAuth Setup

### 2.1 Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in the form:
   - **Application name**: Aimentions
   - **Homepage URL**: `http://localhost:3000` (dev) or `https://your-domain.com` (prod)
   - **Application description**: AI Keyword Research Tool
   - **Authorization callback URL**: 
     - `http://localhost:3000/api/auth/callback/github` (dev)
     - `https://your-domain.com/api/auth/callback/github` (prod)

4. Click **"Register application"**
5. Note your **Client ID** and generate a **Client Secret**

## Step 3: Update Environment Variables

### 3.1 Local Development

Add these to your `.env.local` file:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
GITHUB_ID="your_github_client_id_here"
GITHUB_SECRET="your_github_client_secret_here"
```

### 3.2 Production (Render)

Add these environment variables in your Render dashboard:

```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_ID=your_github_client_id_here
GITHUB_SECRET=your_github_client_secret_here
```

## Step 4: Test OAuth Integration

### 4.1 Local Testing

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. Click **"Continue with Google"** or **"Continue with GitHub"**
4. Complete the OAuth flow
5. You should be redirected to `/dashboard`

### 4.2 Production Testing

1. Deploy your app to production
2. Update OAuth redirect URIs in Google Cloud Console and GitHub
3. Test the sign-in flow on your production domain

## Step 5: Security Best Practices

### 5.1 Environment Variables

- **Never commit secrets** to version control
- Use environment variables for all sensitive data
- Rotate secrets regularly

### 5.2 OAuth Configuration

- Use HTTPS in production
- Restrict authorized domains to your actual domain
- Monitor OAuth usage in Google Cloud Console and GitHub

### 5.3 Session Management

- Use secure session cookies
- Implement proper session expiration
- Handle OAuth errors gracefully

## Troubleshooting

### Common Issues

#### "Invalid redirect URI" Error
- Check that your redirect URIs match exactly in OAuth configuration
- Ensure protocol (http/https) and port numbers are correct
- Verify domain names are spelled correctly

#### "Client ID not found" Error
- Verify your environment variables are set correctly
- Check that the OAuth app is properly configured
- Ensure you're using the correct Client ID

#### "OAuth consent screen not configured" Error
- Complete the OAuth consent screen setup in Google Cloud Console
- Add your domain to authorized domains
- Verify your app is published (if required)

#### GitHub OAuth Issues
- Check that your GitHub OAuth app is properly configured
- Verify callback URLs match exactly
- Ensure your GitHub account has the necessary permissions

### Debug Mode

Enable debug mode in development by setting:

```bash
NODE_ENV=development
```

This will show detailed OAuth logs in your console.

## Production Deployment Checklist

### Before Going Live

- [ ] Update OAuth redirect URIs to production domain
- [ ] Set production environment variables
- [ ] Test OAuth flow on production domain
- [ ] Configure proper session settings
- [ ] Set up monitoring for OAuth errors
- [ ] Update privacy policy and terms of service

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure session cookies
- [ ] Implement rate limiting
- [ ] Monitor OAuth usage
- [ ] Set up error logging
- [ ] Configure proper CORS settings

## Support Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [OAuth Security Best Practices](https://oauth.net/2/security/)

## Next Steps

After setting up OAuth:

1. **Test the complete authentication flow**
2. **Set up user profile management**
3. **Implement role-based access control**
4. **Add email verification (optional)**
5. **Set up user onboarding flow**

---

**Status**: Ready for OAuth integration! 🔐

Once you've completed this setup, your authentication system will be fully functional with:
- ✅ Google OAuth sign-in
- ✅ GitHub OAuth sign-in
- ✅ Secure session management
- ✅ User profile creation
- ✅ Database integration
