<div align="center">

# 🩺 Caption AI — Social Media SaaS for Healthcare

**AI-Powered Social Captions & Scheduling Built Specifically for Medical & Dental Practices.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Android App](https://img.shields.io/badge/Android-APK%20Ready-3DDC84?logo=android&logoColor=white)](#-android-mobile-app-apk)
[![PWA](https://img.shields.io/badge/PWA-Installable-blueviolet?logo=pwa&logoColor=white)](#-progressive-web-app-pwa)
[![License](https://img.shields.io/badge/License-Private-red)](#)

[Live Demo](#-instant-live-demo) • [Key Features](#-key-features) • [Architecture](#-architecture) • [Android App](#-android-mobile-app-apk) • [Local Setup](#-getting-started) • [API Docs](#-api-routes) • [Testing](#-automated-testing)

</div>

---

## 🌟 Overview

**Caption AI** solves the healthcare social media dilemma: doctors and dentists want to maintain an active online presence on Instagram and Facebook, but generic marketing agencies lack clinical context, while staff lack time.

With Caption AI, a clinic sets up its specialty, voice samples, and knowledge bank notes (e.g., *"We installed digital 3D imaging"* or *"Extended evening hours"*). The AI synthesizes authentic, medically sound, and engaging captions ready for immediate review, approval, and scheduling.

---

## 🚀 Key Features

### 🏥 Healthcare-Specific AI Engine
- **Clinical Persona & Voice Match:** Captions adapt to your specialty (Dental, Orthodontics, Dermatology, Family Medicine) and mimic your clinic's tone.
- **Knowledge-Bank Grounding:** Avoids AI hallucinations; pins real clinical updates, clinic policies, and service promotions.
- **Pre-Prompted Medical Safety:** Avoids unverified clinical guarantees, sensitive medical advice, or deceptive claims.

### 📱 Responsive Web & Native Android App
- **Fluid Multi-Device Layout:** 100% responsive across mobile (320px–430px), tablets, laptops, and ultra-wide displays. Zero horizontal overflow.
- **Progressive Web App (PWA):** Installable on iOS (Safari) and Android (Chrome) with standalone window display and custom app icons.
- **Native Android APK (`CaptionAI.apk`):** Dedicated Android package compiled with Android SDK 36, edge-to-edge Compose container, and synchronized session CookieManager.

### 🛡️ Enterprise-Grade Security & Isolation
- **Row-Level Security (RLS):** Enforced across all 17 PostgreSQL tables in Supabase. Multi-tenant practice data is strictly isolated.
- **Credential Encryption:** Third-party credentials (e.g., Postiz API keys) are encrypted at rest with AES-256-GCM.
- **Strict Zod Validation:** Every API mutation is validated with strict input and output schemas.

### 📊 Practice Engagement & Analytics
- **Activity Heatmap:** Visual 365-day publication and drafting heatmap powered by PostgreSQL daily aggregation RPC.
- **Daily Topic Curation:** Smart daily clinical topic recommendations with offline curated medical fallback when AI quota is exhausted.

---

## ⚡ Instant Live Demo

The platform includes a dedicated, pre-provisioned demo account pre-seeded with sample clinical practices, notes, and drafts:

- **Demo Account:** `caption-ai-demo+rhtjqxicgwrnghxmwpmi@example.com`
- **One-Click Access:** Click the **⚡ Try Live Demo** button on the home page or sign-in page to launch directly into the dashboard without entering credentials.
- **Idempotent Seed Script:** `npm run seed:demo` provisions verified practice entities, knowledge notes, and sample captions on demand.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT CLIENT SURFACES                        │
│   Desktop & Mobile Web (PWA)       Native Android App (Compose+WebView)│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS / WSS
┌──────────────────────────────────▼─────────────────────────────────────┐
│                       NEXT.JS 16 APP ROUTER (SSR)                      │
│   ├── Middleware Proxy (src/proxy.ts) ── Session & Cookie Refresh      │
│   ├── Health Check API (/api/health) ── Diagnostics & Telemetry        │
│   ├── Auth Service (/api/auth/*) ────── Supabase Auth & Demo Grant     │
│   └── Practice APIs (/api/practices/*) ─ Input Validation (Zod)         │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
┌──────────────────▼───────────────┐ ┌─────────────▼─────────────────────┐
│       SUPABASE POSTGRESQL        │ │         EXTERNAL SERVICES         │
│  - 17 Relational Tables          │ │  - OpenAI GPT-4o Engine           │
│  - Row-Level Security (RLS)      │ │  - Postiz Social Publishing API   │
│  - Daily Heatmap Aggregation RPC │ │  - AES-256-GCM Cryptographic Key  │
│  - Storage Buckets for Media     │ └───────────────────────────────────┘
└──────────────────────────────────┘
```

---

## 📱 Android Mobile App (APK)

A native Android wrapper is included in `caption-ai-mobile/` and pre-compiled directly in your repository root:

- **Artifact File:** `caption.apk` (also mirrored in your system `Downloads/CaptionAI.apk`)
- **Package ID:** `com.captionai.app`
- **Target SDK:** Android 36 (Android 15+)
- **Minimum SDK:** Android 24 (Android 7.0+)
- **Features:** Hardware accelerated WebView, CookieManager session synchronization, edge-to-edge system bars.

### How to Install:
1. Share `caption.apk` to your phone via WhatsApp or USB cable.
2. Tap the APK on your Android device and select **Install**.
3. Tap **Open** to launch Caption AI directly from your app drawer.

---

## 🌐 Progressive Web App (PWA)

Caption AI implements the standard Web App Manifest (`/manifest.webmanifest`) and iOS Apple touch meta-tags:

- **Android (Chrome):** Tap menu `(⋮)` ➔ **Install App**.
- **iOS (Safari):** Tap Share icon `(↑)` ➔ **Add to Home Screen**.
- The app installs as a standalone icon and runs in full-screen mode without browser chrome.

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.3 | Turbopack, App Router, React 19, Server Components |
| **Language** | TypeScript 5 | Strict type safety, explicit generic relations |
| **Backend & Auth** | Supabase SSR | Cookie-based session validation, PKCE callback exchange |
| **Database** | PostgreSQL | 17 tables, RLS policies, custom indexes, RPC functions |
| **AI Models** | OpenAI GPT-4o | Specialized healthcare prompt engineering & fallback topics |
| **Security** | Node.js `crypto` | AES-256-GCM authenticated credential encryption |
| **Validation** | Zod 4.6 | Schema verification on all ingress and egress payloads |
| **Mobile** | Kotlin & Jetpack Compose | Native Android app with synchronized WebView |
| **Testing** | Node.js Test Runner | 20 unit, schema, and security tests |

---

## 🚦 Getting Started

### Prerequisites
- Node.js 20+ installed
- A configured Supabase project (or access to the pre-configured project in `.env.local`)

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/08DevashishSrivastava/SAAS.git
cd SAAS/caption-ai

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# (Verify your Supabase keys and application encryption key in .env.local)

# 4. Seed demo data (idempotent)
npm run seed:demo

# 5. Start development server
npm run dev
```

App will be live at:
- **Local PC:** `http://localhost:3000`
- **Mobile Wi-Fi:** `http://<your-local-ip>:3000`

---

## 🧪 Automated Testing & Verification

Every layer of Caption AI is covered by automated verification commands:

```bash
# Run unit & schema tests (20/20 tests)
npm test

# Run TypeScript type-checker
npm run typecheck

# Run ESLint validation
npm run lint

# Compile optimized production build
npm run build
```

### Verified Test Suites:
- `tests/unit/encryption.test.mts`: AES-256-GCM round-trip, unique IV randomness, and auth-tag tamper verification.
- `tests/unit/validation.test.mts`: Zod validation for auth, practice profile, captions, scheduling, and AI payloads.
- `tests/unit/streaks.test.mts`: Activity streaks, timezone boundaries, leap years, and heatmap calculation.

---

## 🔌 API Routes

| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | Real-time connectivity health check for DB, Auth, and services. |
| `/api/auth/demo-login` | `POST` | Public | One-click login using verified demo credentials. |
| `/api/practices` | `GET, POST` | User | List and create tenant practices. |
| `/api/practices/[id]/captions` | `GET, POST` | User | Retrieve drafts or save newly generated captions. |
| `/api/practices/[id]/captions/generate` | `POST` | User | Execute prompt against OpenAI GPT-4o with practice voice. |
| `/api/practices/[id]/notes` | `GET, POST` | User | Manage clinic knowledge-bank updates and promotions. |
| `/api/captions/[id]/schedule` | `POST` | User | Schedule post delivery via social accounts. |
| `/api/dashboard/metrics` | `GET` | User | Live streak, drafted count, and year-long heatmap data. |

---

## 🔐 Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Canonical app URL (e.g. `http://localhost:3000`). |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL endpoint. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Yes** | Client publishable API key for Supabase Auth and PostgREST. |
| `SUPABASE_SECRET_KEY` | Server-Only | Service role key for admin scripts (never exposed to client). |
| `APPLICATION_ENCRYPTION_KEY` | **Yes** | 32-byte (64 hex characters) AES-256-GCM encryption secret. |
| `NEXT_PUBLIC_ENABLE_DEMO_LOGIN` | Optional | Set `true` to display the one-click demo button. |
| `SUPABASE_DEMO_EMAIL` | Optional | Email for provisioned demo user. |
| `SUPABASE_DEMO_PASSWORD` | Optional | Password for provisioned demo user. |
| `OPENAI_API_KEY` | Optional | OpenAI API key for live GPT-4o caption generation. |
| `POSTIZ_API_BASE_URL` | Optional | Self-hosted or cloud Postiz instance base URL. |

---

## 📄 License & Maintainer

Maintained by **Devashish Srivastava** ([@08DevashishSrivastava](https://github.com/08DevashishSrivastava)).  
*Private & proprietary software.*
