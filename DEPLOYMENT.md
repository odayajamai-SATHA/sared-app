# Sared App - Deployment Guide

Step-by-step guide for publishing Sared to Google Play Store and Apple App Store using EAS Build (Expo Application Services).

---

## Prerequisites

1. **Expo Account**: Create one at https://expo.dev/signup
2. **Apple Developer Account** ($99/year): https://developer.apple.com/programs/
3. **Google Play Console Account** ($25 one-time): https://play.google.com/console/signup
4. **Node.js 18+** installed
5. **EAS CLI** installed globally

```bash
npm install -g eas-cli
```

---

## Step 1: Login to Expo & EAS

```bash
eas login
```

Enter your Expo account credentials when prompted.

---

## Step 2: Configure EAS Build

Run the following command to generate an `eas.json` config file:

```bash
eas build:configure
```

Then update `eas.json` to include these profiles:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "production"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

---

## Step 3: Update app.json for Production

Update your `app.json` with production values:

```json
{
  "expo": {
    "name": "Sared - سارد",
    "slug": "sared-app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.sared.app",
      "buildNumber": "1",
      "supportsTablet": true
    },
    "android": {
      "package": "com.sared.app",
      "versionCode": 1
    }
  }
}
```

---

## Step 4: Build for Android (Google Play)

### 4a. Generate a production AAB (Android App Bundle)

```bash
eas build --platform android --profile production
```

This will:
- Create an Android signing keystore (first time only - **save the credentials!**)
- Build the AAB in the cloud
- Provide a download link when complete

### 4b. (Optional) Build a test APK

```bash
eas build --platform android --profile preview
```

---

## Step 5: Build for iOS (App Store)

### 5a. Generate a production IPA

```bash
eas build --platform ios --profile production
```

This will:
- Prompt you to log in to your Apple Developer account
- Auto-generate provisioning profiles and certificates
- Build the IPA in the cloud
- Provide a download link when complete

---

## Step 6: Submit to Google Play Store

### 6a. First-time setup

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app called "Sared - سارد"
3. Complete the store listing:
   - App name: **Sared - سارد**
   - Short description: **Flatbed tow trucks on demand | سطحات نقل على الطلب**
   - Full description: Write a detailed description in both Arabic and English
   - Upload screenshots (phone + tablet)
   - Upload the app icon (512x512 PNG)
   - Set category: **Maps & Navigation** or **Travel & Local**
   - Set content rating (complete the questionnaire)
   - Set pricing: **Free**
4. Create a Google Cloud service account for automated submissions:
   - Go to Google Cloud Console → IAM → Service Accounts
   - Create a service account with Play Console access
   - Download the JSON key file as `google-services.json`

### 6b. Submit via EAS

```bash
eas submit --platform android --profile production
```

Or submit the latest build automatically:

```bash
eas submit --platform android --latest
```

---

## Step 7: Submit to Apple App Store

### 7a. First-time setup

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app:
   - Name: **Sared - سارد**
   - Bundle ID: `com.sared.app`
   - Primary language: **Arabic** (with English localization)
   - SKU: `sared-app`
3. Complete the app information:
   - Category: **Travel** or **Navigation**
   - Privacy Policy URL (required)
   - Upload screenshots for all required device sizes
   - Write description in Arabic and English
   - Set age rating

### 7b. Submit via EAS

```bash
eas submit --platform ios --profile production
```

Or submit the latest build:

```bash
eas submit --platform ios --latest
```

---

## Step 8: Build & Submit Both Platforms at Once

```bash
# Build both platforms
eas build --platform all --profile production

# Submit both platforms
eas submit --platform all
```

---

## Over-the-Air (OTA) Updates

For JS-only changes (no native module changes), push updates instantly without app store review:

```bash
# Push an update to production
eas update --branch production --message "Bug fix: improved map loading"
```

Configure update channels in `app.json`:

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

---

## Useful Commands Reference

| Command | Description |
|---|---|
| `eas build --platform android` | Build Android |
| `eas build --platform ios` | Build iOS |
| `eas build --platform all` | Build both |
| `eas submit --platform android` | Submit to Google Play |
| `eas submit --platform ios` | Submit to App Store |
| `eas update` | Push OTA update |
| `eas build:list` | List all builds |
| `eas credentials` | Manage signing credentials |
| `eas device:create` | Register test devices (iOS) |

---

## Troubleshooting

### Build fails with "missing credentials"
```bash
eas credentials
```
Follow the prompts to set up signing credentials.

### iOS build fails with provisioning profile error
```bash
eas credentials --platform ios
# Select "Remove" and then rebuild to auto-generate new profiles
```

### Android keystore lost
**WARNING**: If you lose your Android keystore, you cannot update the existing app on the Play Store. Always back up your keystore:
```bash
eas credentials --platform android
# Select "Download Keystore" to save a backup
```

### Check build status
```bash
eas build:list --limit 5
```

### View build logs
```bash
eas build:view <BUILD_ID>
```
