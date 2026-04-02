import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false,
  tracesSampleRate: 0.2,
  enabled: !__DEV__,
});

export default Sentry;
export const wrap = Sentry.wrap;
