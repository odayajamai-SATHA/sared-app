import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false,
  tracesSampleRate: 0.2,
  profilesSampleRate: 0.1,
  enabled: !__DEV__,
  environment: __DEV__ ? 'development' : 'production',
});

export default Sentry;
export const wrap = Sentry.wrap;
