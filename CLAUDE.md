# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sared (سارد) is an on-demand flatbed tow truck app for Saudi Arabia. React Native/Expo SDK 55 with Supabase backend, Google Maps, and bilingual Arabic/English support.

- **Package**: `app.sared.mobile` (iOS + Android)
- **EAS Project ID**: `70f882d3-12b5-418a-9167-1d06dc836669`
- **Default map center**: Dammam (26.4207, 50.0888)

## Commands

```bash
npx expo start                                    # Dev server
npx expo start --android                           # Android dev
npx expo start --ios                               # iOS dev
npx expo export --platform web                     # Test web bundle
eas build --platform android --profile preview     # Preview APK
eas build --platform android --profile production  # Production AAB
eas build --platform ios --profile production       # Production IPA
eas update --branch production                      # OTA update
```

No test runner or linter is configured.

## Architecture

### Tech Stack
React Native 0.83, Expo 55, React 19.2, React Navigation v7, Supabase (Postgres + Auth + Realtime), react-native-maps, Sentry, expo-notifications, expo-location. State via React Context (no Redux).

### Navigation (App.js)
```
Stack Navigator
├── Splash → Onboarding → Login → OTP
├── Main (Bottom Tab Navigator)
│   ├── Home (map + pickup)
│   ├── Services
│   ├── History
│   └── Profile
├── Service → Size → Destination → PriceGuarantee → Payment → DriverMatching → Booking → Tracking → TripComplete → Receipt
└── Driver flow: DriverLogin → DriverDashboard → DriverJob → DriverNavigation → DriverComplete → DriverEarnings
```

### User Flow
Phone OTP auth → Home (map) → pick service type → pick truck size → set destination → confirm price → match driver → live tracking → trip complete → receipt/rating.

### Driver Flow
Phone OTP auth → Dashboard (toggle online) → accept ride request → navigate to pickup → pick up vehicle → navigate to dropoff → complete trip → view earnings.

## Key Patterns

### Screen Component Convention
Every screen imports `useI18n()` for translations/RTL and `useTheme()` for colors. Navigation is wrapped with `createDebouncedNav()` (300ms cooldown) to prevent double-tap navigation.

```javascript
const navigation = createDebouncedNav(rawNav);
const { t, isRTL } = useI18n();
const { colors, isDark } = useTheme();
```

### RTL Support
Arabic triggers `I18nManager.forceRTL(true)`. Every `flexDirection: 'row'` container with directional content uses `isRTL && styles.rowReverse`. Directional icons flip via `name={isRTL ? 'arrow-back' : 'arrow-forward'}`. Absolute positioning uses `start`/`end` instead of `left`/`right`.

### Animations
Uses React Native `Animated` API. Always set `useNativeDriver: Platform.OS !== 'web'` for cross-platform compat.

### Realtime Data
- **Ride updates**: Supabase Postgres listener on `rides` table (`subscribeToRideUpdates`)
- **Driver GPS**: Supabase Broadcast channel (`broadcastDriverLocation` / `subscribeToDriverLocation`)
- **New ride alerts**: INSERT listener on `rides` table (`subscribeToNewRides`)

## Key Files

| File | Purpose |
|------|---------|
| `src/utils/supabase.js` | Supabase client + 40+ DB functions (auth, rides, drivers, realtime) |
| `src/utils/i18n.js` | 1000+ en/ar translation keys, `I18nProvider`, `useI18n()` hook |
| `src/utils/theme.js` | Light/dark theme context, `useTheme()` hook |
| `src/utils/pricing.js` | Fare calculation: VAT 15%, dispatch fee 50 SAR, per-km rates by size |
| `src/utils/notifications.js` | Push token registration, notification listeners |
| `src/utils/navigation.js` | `createDebouncedNav()` wrapper |
| `src/utils/sentry.js` | Sentry init (disabled in dev) |
| `scripts/generate-icons.js` | Regenerate app icons (`npm i -D sharp && node scripts/generate-icons.js`) |

## Supabase Schema

**Tables**: `users` (phone unique), `drivers` (phone, location, satha_size, rating), `rides` (status lifecycle), `ratings`, `push_tokens`.

**Column name**: The truck size column on `drivers` is `satha_size`, not `sared_size`.

**Ride statuses**: `pending` → `accepted` → `arrived` → `picked_up` → `in_transit` → `completed` (also `cancelled`).

**Key RPC**: `update_ride_status(ride_id, new_status)` — server-side state machine enforcing valid transitions. `find_nearby_drivers(lat, lng, radius)` — PostGIS proximity search.

**RLS**: Enabled on all tables. Authenticated users can read/write their own data. Rides are publicly readable for driver matching.

## Environment Variables

All prefixed `EXPO_PUBLIC_`. Set in `.env` locally and in `eas.json` build profiles:
- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_MOYASAR_KEY` (payment, not yet active)

## Brand

- Primary: `#059669` (emerald green)
- Dark background: `#022C22`
- App icon: flatbed tow truck silhouette, Arabic سارد + English SARED
