# Supabase Setup Guide for Sared App

## Step 1: Create a Free Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **Start your project** (or **Sign Up**)
3. Sign in with your GitHub account (or email)
4. You're now on the Supabase dashboard

## Step 2: Create a New Project

1. Click **New Project**
2. Choose your organization (or create one)
3. Fill in:
   - **Project name**: `sared-app`
   - **Database password**: Choose a strong password (save it!)
   - **Region**: Choose the closest to Saudi Arabia (e.g., `Central EU (Frankfurt)` or `West EU (London)`)
4. Click **Create new project**
5. Wait ~2 minutes for the project to be provisioned

## Step 3: Get Your API Credentials

1. In your project dashboard, go to **Settings** (gear icon) > **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUz...` (the long JWT token)

## Step 4: Connect to Your App

Open the file `src/utils/supabase.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';     // <-- paste your Project URL
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';                       // <-- paste your anon key
```

## Step 5: Run the Database Setup Script

1. In the Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase_setup.sql` from this project
4. Copy the entire contents and paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see a success message and a table showing the 2 seed drivers:

| name | sared_size | rating |
|------|-----------|--------|
| Ahmed | medium | 4.8 |
| Mohammed | large | 4.6 |

## Step 6: Enable Phone OTP Authentication

1. In the Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Phone** and enable it
3. For development/testing, you have two options:

### Option A: Use Supabase's Test OTP (Recommended for Development)

1. Go to **Authentication** > **Providers** > **Phone**
2. Enable **Phone provider**
3. Under **SMS Provider**, select **Twilio** (or leave default for testing)
4. For testing without Twilio: Go to **Authentication** > **URL Configuration**
5. Enable **Enable email confirmations** is OFF for testing
6. Use Supabase's built-in test mode - any OTP code `123456` will work in development

### Option B: Set Up Twilio for Real SMS (Production)

1. Create a [Twilio account](https://www.twilio.com/try-twilio)
2. Get a Twilio phone number
3. In Supabase **Authentication** > **Providers** > **Phone**:
   - **Twilio Account SID**: From Twilio console
   - **Twilio Auth Token**: From Twilio console
   - **Twilio Message Service SID** or **Phone Number**: Your Twilio number

## Step 7: Verify Everything Works

1. Start your app: `npx expo start`
2. On the Login screen, enter a phone number
3. Tap "Get OTP" - it should send via Supabase
4. Enter the OTP code on the verification screen
5. You should be logged in and see the map on the home screen

## Troubleshooting

### "Failed to send OTP"
- Check that your Supabase URL and anon key are correct in `supabase.js`
- Make sure Phone auth is enabled in Supabase Authentication settings
- Check the Supabase logs: **Logs** > **Auth** in the dashboard

### Maps not showing
- Make sure location permissions are granted on your device
- On Android emulator: Set a mock location in emulator settings
- On iOS simulator: Debug > Location > Custom Location

### Database errors
- Re-run the `supabase_setup.sql` script
- Check the SQL Editor output for any error messages
- Make sure RLS policies are created (they allow public read/write for development)

## Project Architecture

```
supabase/
├── Tables
│   ├── users        - App users (phone, name, language)
│   ├── drivers      - Sared drivers (location, status, rating)
│   ├── rides        - Ride requests and tracking
│   └── ratings      - User ratings for drivers
├── Auth
│   └── Phone OTP    - SMS-based authentication
└── Realtime
    ├── rides        - Live ride status updates
    └── drivers      - Live driver location updates
```

## Seed Data

The setup script creates 2 sample drivers:

| Driver | Phone | Sared Size | Rating | Location |
|--------|-------|-----------|--------|----------|
| Ahmed | +966501234567 | Medium | 4.8 | Riyadh Center |
| Mohammed | +966509876543 | Large | 4.6 | Riyadh North |

You can use these driver accounts to test the driver flow by logging in with their phone numbers.
