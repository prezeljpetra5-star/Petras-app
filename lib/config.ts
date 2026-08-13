// The app never talks to Anthropic directly — it only calls this proxy.
// Set EXPO_PUBLIC_API_URL in your .env (see README) to your machine's LAN
// address, e.g. http://192.168.1.23:3001, so a phone running Expo Go can
// reach the server. Defaults to localhost for simulators/web.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
