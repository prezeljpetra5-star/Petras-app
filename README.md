# Petra's App

A personal daily companion app: a calm morning briefing on world markets, a
filtered feed of AI news, on-demand wellness recipes, and a context-aware
chat — all in one small Expo app.

- **Investing** — a daily 5–7 bullet briefing generated from live RSS
  headlines, with a market mood indicator.
- **AI News** — same idea for AI news, with category filters and an
  "I'm new to this" simplified-explanation toggle.
- **Recipes** — describe a goal in your own words (or tap a quick pick) and
  get a full recipe with scalable servings and step-by-step checkboxes.
- **Chat** — a floating button on every tab opens a chat that knows what
  you're currently looking at.

The app never talks to Anthropic directly. All AI calls go through a small
proxy server in [`/server`](./server) that holds the API key.

## Project structure

```
app/                 expo-router screens (file-based routing)
  (tabs)/             the three-tab bottom navigator
  chat.tsx            chat modal
  favorites.tsx        saved articles + favorite recipes
  settings.tsx         daily notification settings
components/          small reusable UI pieces
lib/                 API client, AsyncStorage helpers, types, haptics
hooks/               data-fetching hooks (e.g. useDigest)
contexts/            React context for the chat's current context
theme/               light/dark palette + per-tab accent colors
server/              the Express proxy that calls the Anthropic API
```

## 1. Set up the backend proxy

The proxy holds your Anthropic API key and exposes `/api/digest`,
`/api/recipe`, `/api/chat`, and `/api/simplify`. The app only ever calls
this proxy — the key is never bundled into the app.

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and put your key in:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

Start it:

```bash
npm start
```

You should see `Petra's App proxy server listening on http://localhost:3001`.
Leave this running in its own terminal while you use the app.

## 2. Point the app at the proxy

From the project root, copy the example env file:

```bash
cp .env.example .env
```

`EXPO_PUBLIC_API_URL` in `.env` tells the app where the proxy is:

- **iOS Simulator or web**: `http://localhost:3001` (the default) works as-is.
- **Android Emulator**: use `http://10.0.2.2:3001`.
- **A physical phone in Expo Go**: use your computer's LAN IP, e.g.
  `http://192.168.1.23:3001`. Find it with `ipconfig getifaddr en0` (Mac) or
  `ipconfig` (Windows). Your phone and computer must be on the same Wi-Fi
  network, and the proxy server must be reachable on that network (some
  corporate/guest networks block this).

## 3. Run the app

From the project root:

```bash
npm install
npm start
```

This opens the Expo dev tools in your terminal with a QR code.

- **On your phone**: install the **Expo Go** app (App Store / Play Store),
  then scan the QR code with your phone's camera (iOS) or directly within
  Expo Go (Android).
- **iOS Simulator**: press `i` in the terminal (macOS + Xcode required).
- **Android Emulator**: press `a` in the terminal (Android Studio required).
- **Web**: press `w`.

Both the proxy (`server/`) and the Expo dev server (project root) need to be
running at the same time.

## Notes

- **Offline / instant open**: digests are cached locally with AsyncStorage
  and refetched only if they're older than 6 hours or you pull to refresh,
  so the app opens instantly and works offline with the last briefing.
- **Daily notification**: turn it on in Settings (gear icon on any tab) and
  pick a time — you'll get a local "Your briefing is ready" reminder.
- **Model**: the server calls `claude-sonnet-4-6` for every AI request.
- **Dark mode**: follows your system setting automatically.

## Troubleshooting

- *"Couldn't load today's briefing"* — make sure `server` is running and
  `EXPO_PUBLIC_API_URL` points to a URL your device/simulator can actually
  reach (see step 2). Check the proxy's terminal for errors.
- *Notifications don't fire in Expo Go on Android* — this is a known Expo Go
  limitation on recent Android versions for scheduled notifications; a
  development build will work correctly.
- *RSS feeds occasionally fail to load* — the digest endpoint skips any
  feed that fails and continues with whatever sources are reachable, so a
  single source going down won't break the briefing.
