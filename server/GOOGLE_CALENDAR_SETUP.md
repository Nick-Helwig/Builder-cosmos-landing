# Google Calendar API Setup Guide

This guide explains how to set up Google Calendar API integration for the custom booking interface.

## Overview

The custom booking interface connects directly to your Google Calendar to:
- Fetch available time slots in EST timezone
- Create appointments with customer information
- Send email confirmations to customers
- Avoid timezone confusion by forcing EST display

## Setup Options

### Option 1: Service Account (Recommended)

Service accounts provide server-to-server access without user interaction.

#### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API

#### 2. Create Service Account
1. Go to IAM & Admin → Service Accounts
2. Click "Create Service Account"
3. Name: `booknow-hair-calendar`
4. Description: `Calendar access for appointment booking`
5. Click "Create and Continue"

#### 3. Create Service Account Key
1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose JSON format
5. Download the key file

#### 4. Share Calendar with Service Account
1. Open Google Calendar
2. Find your business calendar (or create one)
3. Click settings (3 dots) → "Settings and sharing"
4. Under "Share with specific people":
   - Add the service account email (from JSON file)
   - Give "Make changes to events" permission

#### 5. Configure Environment Variables
```bash
# Copy the entire JSON content as one line
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id"...}

# Your calendar ID (usually your email or "primary")
GOOGLE_CALENDAR_ID=primary
```

### Option 2: OAuth (Alternative)

OAuth requires initial user consent but provides more flexibility.

#### 1. Create OAuth Credentials
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: Web application
4. Name: `Booknow Hair Booking`
5. Authorized redirect URIs: `http://localhost:3001/auth/google/callback`

#### 2. Get Initial Authorization
1. Start your server: `npm run dev`
2. Visit: `http://localhost:3001/api/calendar/auth-url`
3. Copy the authorization URL and visit it
4. Grant calendar access permissions
5. Extract the refresh token from the callback

#### 3. Configure Environment Variables
```bash
GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_CALENDAR_ID=primary
```

## Testing the Setup

### 1. Check API Health
```bash
curl http://localhost:3001/api/calendar/health
```

### 2. Fetch Available Slots
```bash
curl "http://localhost:3001/api/calendar/slots?service=Premium%20Haircut&days=7"
```

### 3. Test Booking (with real data)
```bash
curl -X POST http://localhost:3001/api/calendar/book \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2024-01-25T14:00:00.000Z",
    "endTime": "2024-01-25T14:30:00.000Z",
    "serviceType": "Premium Haircut",
    "customerName": "Test Customer",
    "customerEmail": "test@example.com",
    "customerPhone": "555-0123",
    "notes": "Test booking"
  }'
```

## Business Hours Configuration

Edit `server/services/google-calendar.js` to match your schedule:

```javascript
const businessHours = {
  monday: { start: 9, end: 19 },    // 9 AM - 7 PM
  tuesday: { start: 9, end: 19 },
  wednesday: { start: 9, end: 19 },
  thursday: { start: 9, end: 19 },
  friday: { start: 9, end: 19 },
  saturday: { start: 8, end: 18 },  // 8 AM - 6 PM
  sunday: { start: 10, end: 16 },   // 10 AM - 4 PM
};
```

## Service Duration Configuration

Adjust service durations in the same file:

```javascript
const durations = {
  'Premium Haircut': 30,        // 30 minutes
  'Basic Kids Cut': 30,         // 30 minutes
  'House Call Service': 30,     // 30 minutes
  'Same Day Appointment': 30,   // 30 minutes
};
```

## Timezone Handling

The system is configured to:
- Store all times in EST (`America/New_York`)
- Display all times to users in EST
- Handle daylight saving time automatically
- Override user's local timezone settings

## Security Notes

- **Service Account Key**: Keep the JSON file secure, never commit to git
- **OAuth Credentials**: Store client secret securely
- **Environment Variables**: Use proper `.env` file management
- **Calendar Permissions**: Only grant necessary permissions

## Troubleshooting

### Common Issues

1. **"Calendar API not initialized"**
   - Check environment variables are set correctly
   - Verify JSON format for service account key

2. **"Insufficient permissions"**
   - Ensure calendar is shared with service account
   - Check service account has "Make changes to events" permission

3. **"No available slots"**
   - Verify business hours configuration
   - Check if calendar has conflicting events
   - Ensure date range is correct

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## Production Deployment

For production:
1. Use secure environment variable management
2. Set up proper SSL certificates
3. Configure production OAuth redirect URIs
4. Monitor API quota usage
5. Set up error logging and monitoring

## Support

For issues with the Google Calendar integration:
1. Check server logs for error details
2. Verify API quotas in Google Cloud Console
3. Test API endpoints individually
4. Review calendar sharing permissions
