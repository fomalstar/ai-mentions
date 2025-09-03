# 24-Hour Automated Scanning Setup Guide

## Overview

The AI Mentions platform now supports **24-hour automated scanning** where users can enable automation for individual topics or entire projects. Once enabled, the system will automatically scan every 24 hours without manual intervention.

## Features

### **Project-Level Automation**
- **Enable**: Click "Auto ON" button to enable 24-hour scanning for all topics in a project
- **Disable**: Click "Auto OFF" button to disable automated scanning
- **Status**: Shows current automation status with visual indicators

### **Topic-Level Automation**
- **Enable**: Click the ⚡ button next to each topic to enable individual automation
- **Disable**: Click the ⚡ button again to disable automation for that topic
- **Status**: Green ⚡ button indicates automation is enabled

### **Manual Override**
- **Scan All Projects**: Manual scan button still available for immediate scanning
- **Individual Topic Refresh**: Manual refresh button for individual topics
- **Coexistence**: Automation and manual scanning work together

## How It Works

1. **User enables automation** for a project or topic
2. **System schedules next scan** for 24 hours later
3. **Background job runs** every hour to check for scheduled scans
4. **Automated scans execute** using the same AI scanning logic as manual scans
5. **Results are stored** in the database and displayed in the UI
6. **Next scan is scheduled** for another 24 hours

## Technical Implementation

### **Database Schema Updates**
```prisma
model BrandTracking {
  // ... existing fields ...
  autoScanEnabled Boolean @default(false)
  autoScanStartedAt DateTime?
  autoScanLastRun DateTime?
  nextScanAt DateTime?
}

model KeywordTracking {
  // ... existing fields ...
  autoScanEnabled Boolean @default(false)
  autoScanStartedAt DateTime?
  autoScanLastRun DateTime?
}
```

### **API Endpoints**
- `POST /api/mentions/automation` - Enable/disable automation
- `GET /api/mentions/automation` - Get automation status
- `POST /api/mentions/run-automated-scans` - Run automated scans
- `GET /api/cron/run-automated-scans` - Cron job entry point

### **UI Components**
- Automation toggle buttons (⚡) for projects and topics
- Visual indicators showing automation status
- Tooltips explaining automation functionality

## Setup Instructions

### **1. Database Migration**
Run the Prisma migration to add automation fields:
```bash
pnpm prisma migrate dev --name add_automation_fields
```

### **2. Environment Variables**
Add to your `.env` file:
```env
CRON_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.onrender.com
```

### **3. Cron Job Setup**
Set up a cron job to call the automation endpoint every hour:

#### **Option A: External Cron Service (Recommended)**
Use a service like [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com):

- **URL**: `https://your-app.onrender.com/api/cron/run-automated-scans`
- **Schedule**: Every hour (`0 * * * *`)
- **Headers**: Add `X-Cron-Secret: your-secret-key-here`

#### **Option B: Render Cron Jobs**
If using Render's paid plan, you can set up a cron job in your `render.yaml`:

```yaml
services:
  - type: web
    name: your-app
    env: node
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    cronJobs:
      - name: automated-scans
        schedule: "0 * * * *"
        url: /api/cron/run-automated-scans
        headers:
          X-Cron-Secret: your-secret-key-here
```

#### **Option C: GitHub Actions (Free)**
Create `.github/workflows/cron.yml`:

```yaml
name: Automated Scans Cron Job

on:
  schedule:
    - cron: '0 * * * *'  # Every hour

jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Automated Scans
        run: |
          curl -X GET "https://your-app.onrender.com/api/cron/run-automated-scans" \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}"
```

### **4. Deploy to Render**
Push your changes to trigger a new deployment:
```bash
git add .
git commit -m "Add 24-hour automated scanning feature"
git push origin main
```

## Usage

### **Enabling Automation**

1. **For Entire Project**:
   - Go to the Mention Tracking section
   - Click the "Auto ON" button next to "Scan All Projects"
   - All topics in the project will now be scanned every 24 hours

2. **For Individual Topics**:
   - Find the topic you want to automate
   - Click the ⚡ button (it will turn green when enabled)
   - That specific topic will now be scanned every 24 hours

### **Monitoring Automation**

- **Status Indicators**: Green ⚡ buttons show automation is enabled
- **Next Scan Time**: Check the automation status API for next scheduled scans
- **Scan History**: View automated scan results in the same place as manual scans

### **Disabling Automation**

- **For Project**: Click "Auto OFF" button
- **For Topic**: Click the green ⚡ button again
- **Immediate Effect**: Automation stops immediately, no more scheduled scans

## Troubleshooting

### **Common Issues**

1. **Automation not running**:
   - Check if cron job is properly configured
   - Verify `CRON_SECRET` environment variable is set
   - Check server logs for automation errors

2. **Scans not appearing**:
   - Verify automation is enabled for the project/topic
   - Check if 24 hours have passed since last scan
   - Review server logs for scan execution errors

3. **Database errors**:
   - Ensure Prisma migration has been run
   - Check database connection and permissions
   - Verify schema matches the expected structure

### **Debugging**

- **Check automation status**: `GET /api/mentions/automation`
- **View automated scan logs**: Check server console output
- **Test cron endpoint**: Call `GET /api/cron/run-automated-scans` manually

## Security Considerations

- **Cron Secret**: Use a strong, unique secret for the `CRON_SECRET` environment variable
- **Rate Limiting**: The automation system respects API rate limits
- **User Authorization**: Only project owners can enable/disable automation for their projects
- **Audit Trail**: All automated scans are logged with user and timestamp information

## Performance Notes

- **Efficient Scheduling**: Scans are only run when due (24-hour intervals)
- **Background Processing**: Automated scans don't block user interactions
- **Resource Management**: System respects API rate limits and database constraints
- **Scalability**: Designed to handle multiple users and projects efficiently

## Support

If you encounter issues with the automated scanning system:

1. Check the server logs for error messages
2. Verify your cron job configuration
3. Test the automation endpoints manually
4. Review the troubleshooting section above

For additional help, check the main project documentation or create an issue in the project repository.
