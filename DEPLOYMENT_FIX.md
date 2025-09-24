# 🚀 Keyword Removal Fix - Deployment Instructions

## Problem
The keyword removal feature returns 404 "not found or access denied" because URL-encoded parameters aren't being decoded in the DELETE endpoint.

## Solution
Add URL decoding to the DELETE endpoint in `app/api/mentions/track/route.ts`.

## Files to Update
- `app/api/mentions/track/route.ts` (already fixed locally)

## Deployment Options

### Option 1: Git Repository (Recommended)
```bash
# Initialize git repository
git init
git add .
git commit -m "Fix keyword removal 404 error - add URL decoding"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/aimentions.git
git push -u origin main

# Connect to Render (if not already connected)
```

### Option 2: Manual File Upload
1. Go to your Render dashboard
2. Find your web service
3. Upload the updated `app/api/mentions/track/route.ts` file
4. Trigger a new deployment

### Option 3: Direct Server Edit
If you have server access, edit the file directly on the server.

## What the Fix Does

**Before (causing 404):**
```typescript
const keywordRecord = await prisma.keywordTracking.findFirst({
  where: {
    keyword: keyword.toLowerCase(),  // "dog%20food" (encoded)
    topic: topic.toLowerCase(),      // "What%20is%20the%20best..." (encoded)
    userId: dbUser.id
  }
})
```

**After (fixed):**
```typescript
const decodedKeyword = decodeURIComponent(keyword)  // "dog food" (decoded)
const decodedTopic = decodeURIComponent(topic)      // "What is the best..." (decoded)

const keywordRecord = await prisma.keywordTracking.findFirst({
  where: {
    keyword: decodedKeyword.toLowerCase(),  // "dog food" (decoded)
    topic: decodedTopic.toLowerCase(),      // "What is the best..." (decoded)
    userId: dbUser.id
  }
})
```

## Testing After Deployment
1. Wait for deployment to complete (2-5 minutes)
2. Try removing a keyword by clicking the X button
3. Should work without 404 error

## Current Status
- ✅ Fix implemented locally
- ⏳ Waiting for deployment
- 🔄 Need to push to server

## Environment Status
- ✅ Database: Connected (7 keywords, 2 brands, 21 scan results)
- ✅ AI APIs: All configured (Perplexity, OpenAI, Gemini)
- ✅ Authentication: Working
- ❌ Keyword removal: 404 error (needs deployment)

