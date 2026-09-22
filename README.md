# 🔧 HandyHub

**Your Trusted Service Partner** — a cross-platform marketplace that connects customers with vetted local service professionals (plumbers, electricians, cleaners, carpenters and more) and gives those providers a complete toolkit to run their business.

Built with **React Native + Expo + Supabase**, running on **iOS, Android and Web** from a single codebase.

---

## Table of Contents

- [What HandyHub Does](#what-handyhub-does)
- [Feature Overview](#feature-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Architecture Notes](#architecture-notes)
- [Quality & Verification](#quality--verification)
- [CI/CD](#cicd)
- [Security & Compliance](#security--compliance)
- [Documentation](#documentation)

---

## What HandyHub Does

HandyHub is a **two-sided marketplace**. The same app serves both audiences, switching experience based on the signed-in user's role:

**For customers**
Describe what you need → HandyHub's matching engine ranks nearby, verified providers by distance, rating, experience and completion rate → book, chat in real time, pay, and leave a review.

**For providers**
Register a business profile, pass verification, publish a service catalogue with pricing, accept or decline incoming job requests, track earnings, and build a public rating.

The matching engine is the heart of the product. Rather than a plain list, it scores every eligible provider and only surfaces those that clear a quality threshold, so customers see recommendations instead of noise.

---

## Feature Overview

### 🔐 Authentication & Security
- Email/password auth backed by Supabase Auth, with email verification
- **Forgot-password and reset-password flows** via deep links (`handyhub://`)
- Password strength meter and confirm-password matching
- **Zod schema validation** on every auth and data-entry form
- Session persistence through AsyncStorage with automatic token refresh
- Role-aware routing — customers and providers land in different navigators

### 👤 Customer Experience
- Onboarding carousel, splash screen and personalized home feed
- Browse **30+ service categories** (plumbing, electrical, cleaning, carpentry, painting, gardening, AC repair, appliance repair, pest control, moving, and more)
- **"Need a Service"** flow — describe the job and get matched providers
- Booking creation with date/time, address, special instructions and price estimate
- Booking history with a full status workflow: `pending → confirmed → in_progress → completed / cancelled`
- Provider detail pages with ratings, reviews and service listings
- In-app **real-time messaging** with each provider
- Favourites and profile management with avatar upload

### 🛠️ Provider Experience
- Business registration with type, address, experience, licence and tax details
- **Verification workflow** — submit documents, track approval status, receive admin feedback
- **Service catalogue CRUD** — create, edit, deactivate and delete priced services
- **Job request inbox** — accept or decline matched requests
- **Earnings dashboard** — weekly earnings, completed/active job counts, available and pending balance
- Availability toggle and service radius control

### 🔎 Search & Discovery
- Full-text search across business names, types and categories
- Filters for category, location, price range, radius, verification and availability
- Sorting by rating, price, distance or availability
- **Autocomplete suggestions** drawn from categories and providers
- Geo-aware "nearby providers" search with a PostGIS RPC, falling back to text matching when unavailable

### 🤖 AI Assistant
- Natural-language service recommendations (`app/ai/assistant.ts`)
- Keyword and context-aware matching (seasonal tips, urgency, location)
- Returns ranked suggestions with a reason and confidence score

### 🌍 Internationalization
- **10 languages**: English, Español, Français, Deutsch, العربية, 中文, हिन्दी, Português, Русский, 日本語
- Runtime language switching via a dedicated picker component
- Centralized translation framework in `app/i18n/`

### 🔔 Engagement & Admin
- Push-notification and in-app notification frameworks
- Realtime subscriptions for messages and booking updates
- **Admin dashboard** — platform stats, user and provider management
- Analytics and monitoring hooks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo `~54.0.30` |
| UI | React `19.1.0`, React Native `0.81.5` |
| Routing | Expo Router `~6.0.21` (file-based, typed routes) |
| Backend | Supabase (`@supabase/supabase-js ^2.89.0`) — Postgres, Auth, Realtime, Storage |
| Validation | Zod `^4.6.5` |
| Animation | React Native Animated + Reanimated `~4.1.1` |
| Maps | `react-native-maps` `1.20.1`, `expo-location` |
| Media | `expo-image-picker`, `expo-document-picker`, `expo-file-system` |
| Testing | Jest `29` with `jest-expo` |
| Linting | ESLint `9` with `eslint-config-expo` |
| Language | TypeScript `~5.9.2` (strict) |

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **npm** (or yarn/pnpm)
- For native devices: **Expo Go** on your phone, or Android Studio / Xcode for simulators

### Installation

```bash
git clone https://github.com/shetty0003/Handy-Hub.git
cd Handy-Hub
npm install
```

### Configure the environment

Create a `.env` file in the project root (see [Environment Variables](#environment-variables)):

```bash
cp .env.example .env
# then fill in your Supabase credentials
```

### Run it

```bash
npm start          # Expo dev server — press a / i / w
npm run android    # Android emulator or device
npm run ios        # iOS simulator (macOS only)
npm run web        # Browser
```

---

## Environment Variables

Create `.env` in the project root with:

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public API key |

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> **Never commit `.env`.** It is already listed in `.gitignore`. Only the `EXPO_PUBLIC_*` prefix is exposed to the client bundle — never put a service-role key there.

### Database setup

Apply the migrations in `supabase/migrations/` to your project (via the Supabase CLI or SQL editor), in filename order. They create the core schema, the phase-2 tables and the expanded service categories.

---

## Available Scripts

| Script | Does |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Start with the Android target |
| `npm run ios` | Start with the iOS target |
| `npm run web` | Start with the web target |
| `npm run reset` | Start with a cleared Metro cache |
| `npm run clean` | Remove `node_modules` and reinstall |
| `npm run lint` | ESLint over the project |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest test suite |

---

## Project Structure

```
Handy-Hub/
├── app/                        # Expo Router — file-based routes
│   ├── _layout.tsx             # Root layout (providers, error boundary)
│   ├── index.tsx               # Entry / redirect logic
│   ├── splash.tsx              # Animated splash
│   ├── welcome.tsx             # Onboarding carousel
│   ├── needservice.tsx         # Describe-your-job flow
│   ├── serviceselectionscreen  # Service picker
│   ├── search.tsx              # Search results
│   ├── search/filters.tsx      # Advanced filter sheet
│   ├── providers/              # Provider directory
│   ├── provider/[id].tsx       # Provider detail page
│   ├── bookings/               # Booking list + detail
│   ├── booking/[id].tsx
│   ├── messages/[id].tsx       # Realtime chat thread
│   ├── notification.tsx
│   ├── admin/index.tsx         # Admin dashboard
│   ├── (tabs)/                 # Customer tab navigator
│   │   ├── index.tsx           #   Home
│   │   ├── explore.tsx         #   Explore
│   │   ├── jobs.tsx            #   My bookings
│   │   └── profile.tsx         #   Profile
│   ├── (provider-tabs)/        # Provider tab navigator
│   │   ├── index.tsx           #   Dashboard
│   │   ├── requests.tsx        #   Job requests
│   │   ├── services.tsx        #   Service catalogue
│   │   ├── earnings.tsx        #   Earnings
│   │   └── profile.tsx         #   Business profile
│   ├── (provider)/             # Provider sub-screens
│   │   ├── verification.tsx
│   │   ├── edit-profile.tsx
│   │   └── services.tsx
│   ├── auth/                   # Auth flow
│   │   ├── login.tsx  signin.tsx  providers-signup.tsx
│   │   └── forgotpassword.tsx  reset-password.tsx  success.tsx
│   ├── ai/assistant.ts         # Recommendation engine
│   ├── i18n/index.ts           # Translations (10 languages)
│   ├── components/             # ErrorBoundary, LanguagePicker, …
│   └── utils/                  # authHelpers, serviceHelpers, searchHelpers,
│                               # profileHelpers, validation, monitoring, …
├── components/                 # Shared UI primitives
│   ├── themed-text.tsx  themed-view.tsx
│   └── ui/
├── hooks/                      # useAuth, theme hooks
├── utils/                      # supabase client, errorHandler,
│                               # databaseHelpers, profileHelper, deepLinkHandler
├── constants/theme.ts          # Colors & typography
├── supabase/migrations/        # SQL schema migrations
├── __tests__/                  # Jest tests
├── .github/workflows/ci-cd.yml # CI/CD pipeline
└── assets/images/              # Icons, splash art
```

---

## Database Schema

Core tables created by `supabase/migrations/`:

| Table | Purpose |
|---|---|
| `profiles` | Every user — name, email, phone, `user_type`, verification status, location |
| `providers` | Business profile — name, type, address, licence, rating, earnings, availability |
| `service_categories` | The 30+ marketplace categories (name, icon, colour) |
| `services` | A provider's priced offerings (title, category, price, duration, active flag) |
| `bookings` | A job between a customer and provider, with status and scheduling |
| `reviews` | Star ratings and written feedback left by customers |
| `provider_verification` | Document submissions and approval state for providers |

Row Level Security is enabled so users can only read and write their own records.

---

## Architecture Notes

**Role-based navigators.** Expo Router route groups `(tabs)` and `(provider-tabs)` give customers and providers completely separate tab bars, decided after login by reading `profiles.user_type`.

**Shared helper layer.** Data access lives in `app/utils/*` and `utils/*` rather than inside components, so screens stay presentational and logic stays testable.

**Unified error handling.** `utils/errorHandler.ts` exposes `handleError(error, context)`, which returns both a user-safe `userMessage` and a developer-facing `logMessage`. Every catch block routes through it so no raw database error ever reaches the UI.

**Validation at the edges.** Zod schemas in `app/utils/validation.ts` guard all user input; `validateSchema()` normalizes Zod issues into a flat `{ field: message }` map.

**Matching engine.** `findMatchingProviders()` weights distance (40%), rating (30%), experience (20%) and completion rate (10%), applies an urgency multiplier for emergency jobs, and filters out providers below the quality threshold.

**Offline-friendly auth.** The Supabase client persists sessions in AsyncStorage with auto-refresh, so users stay signed in across restarts.

---

## Quality & Verification

The project is verified green across all four gates:

```bash
npm run typecheck    # TypeScript — 0 errors
npm run lint         # ESLint — 0 errors
npm test             # Jest — passing
npx expo export --platform web --output-dir dist   # production bundle builds
```

The exported bundle was additionally rendered in a headless browser to confirm the app actually mounts and paints — not merely that it compiles — with **0 console errors and 0 failed network requests**.

> **Note on lint warnings:** the React Compiler rules bundled with `eslint-config-expo` flag the classic React Native `Animated` + `useRef(...).current` pattern used for the splash/onboarding animations. That pattern is documented and correct, so those specific rules are scoped to warnings in `eslint.config.js`. Genuine issues still surface; CI does not fail on false positives.

---

## CI/CD

`.github/workflows/ci-cd.yml` runs on pushes and pull requests to `master`/`main`:

1. **test** — install, lint, typecheck, Jest
2. **build** — `expo export` verifies the app bundles
3. **deploy-staging** — on `develop` or a `[staging]` commit tag
4. **deploy-production** — on `master`

---

## Security & Compliance

- **Row Level Security** on every table — users access only their own data
- **Zod validation** on all input paths, with sanitization (trim/lowercase) on auth fields
- **Error boundary** at the root catches render failures and shows a recoverable UI
- **No secrets in the bundle** — only `EXPO_PUBLIC_*` variables reach the client
- **GDPR/CCPA tooling** — data export and account deletion in `app/utils/complianceHelpers.ts`
- **Privacy policy** — see [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md)
- **Disaster recovery** — see [`DISASTER_RECOVERY.md`](./DISASTER_RECOVERY.md)

### Reporting a vulnerability

Please do **not** open a public issue for security problems. Report privately to the maintainer instead.

---

## Documentation

| Document | Contents |
|---|---|
| [`APP_DOCUMENTATION.md`](./APP_DOCUMENTATION.md) | Full feature and phase breakdown |
| [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md) | Data handling and user rights |
| [`DISASTER_RECOVERY.md`](./DISASTER_RECOVERY.md) | Backup and recovery procedures |
| [`handyhub_production_spec.txt`](./handyhub_production_spec.txt) | Production specification |
| [`handyhub-roadmap.html`](./handyhub-roadmap.html) | Interactive roadmap dashboard |

---

## License

This project is private and proprietary. All rights reserved.

---

<p align="center">Built with ❤️ using React Native, Expo and Supabase</p>
