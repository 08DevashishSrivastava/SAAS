<div align="center">

# 🩺 Caption AI — Social Media SaaS for Healthcare Practices

### *Social Captions That Truly Sound Like Your Practice — Powered by Specialized Clinical AI.*

[![Live Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://saas-pikn.vercel.app/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI GPT-4o](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Android APK](https://img.shields.io/badge/Android-APK%20Ready-3DDC84?style=for-the-badge&logo=android&logoColor=white)](#-android-mobile-app-apk)
[![PWA](https://img.shields.io/badge/PWA-Installable-F60?style=for-the-badge&logo=pwa&logoColor=white)](#-progressive-web-app-pwa)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](#)

<br />

### 🌐 **[Launch Live Web Application (saas-pikn.vercel.app)](https://saas-pikn.vercel.app/)**
### ⚡ **[Explore Features & Capabilities (saas-pikn.vercel.app/#features)](https://saas-pikn.vercel.app/#features)**

<br />

[Live Demo](#-instant-1-click-live-demo) • [Features](#-key-features) • [Architecture](#-system-architecture) • [Android App](#-android-mobile-app-apk) • [PWA Guide](#-progressive-web-app-pwa) • [Getting Started](#-getting-started) • [API Reference](#-api-routes) • [Automated Tests](#-automated-testing--verification)

---

</div>

<br />

## 🌟 What is Caption AI?

Maintaining a consistent, authoritative, and engaging presence on Instagram, Facebook, and LinkedIn is a major growth driver for healthcare practices. However, **generic AI copywriters fail clinicians**:
- They sound robotic, overly salesy, or make unverified medical claims.
- Outside agencies lack day-to-day context of clinic operations and specific services.
- Doctors and practice managers are too busy to write social captions from scratch.

**Caption AI** bridges this gap. Designed specifically for **Dental, Orthodontics, Dermatology, Plastic Surgery, Optometry, and Family Medicine practices**, it combines custom **clinical voice profiles** with your clinic's **live knowledge bank** (equipment upgrades, team bios, operational hours, special promotions). The result is medically grounded, high-converting social copy ready for 1-click review and auto-scheduling.

---

## ⚡ Instant 1-Click Live Demo

Experience the complete application right now without any signup friction:

| Surface | Direct Link & Access |
| :--- | :--- |
| 🚀 **Live Production URL** | **[saas-pikn.vercel.app](https://saas-pikn.vercel.app/)** |
| 🔍 **Interactive Feature Tour** | **[saas-pikn.vercel.app/#features](https://saas-pikn.vercel.app/#features)** |
| ⚡ **Instant 1-Click Demo** | Click **"Enter Live Demo Account"** on the [Sign-In Page](https://saas-pikn.vercel.app/sign-in) |
| 📱 **Android Native App** | Download and install [`caption.apk`](#installation-steps) directly onto your phone |

> **Note on Zero-Config Vercel Fallback**: The app includes built-in secure fallbacks so all demo accounts, Supabase authentication, and mock clinical metrics work out-of-the-box without requiring manual environment configuration.

---

## 🚀 Key Features

### 🏥 Healthcare-Specific AI Engine
- **Clinical Persona Calibration:** Captions adapt to your specialty (e.g., gentle & comforting for pediatric dentistry, clinical & authoritative for dental implants).
- **Knowledge-Bank Grounding:** AI captions strictly reference real facts from your practice notes (e.g., *"We just introduced low-radiation 3D CBCT imaging"*).
- **Pre-Prompted Medical Safety:** Built-in safeguards reject sensationalist claims, speculative diagnoses, or deceptive promises.

### 📊 Practice Engagement & Daily Habits
- **365-Day Activity Heatmap:** GitHub-style visual publication matrix powered by a high-performance PostgreSQL daily aggregation RPC.
- **Publishing Streaks & Motivation:** Tracks continuous content creation momentum across your clinical team.
- **Smart Daily Topic Curation:** Daily prompt inspiration with offline medical fallback topics when AI quotas are paused.

### 📱 True Omnichannel Experience (Web + Mobile App)
- **100% Mobile Responsive:** Fluid layouts built with mobile-first CSS (tested on iPhone 12/14/16, Pixel 7/8/9, Galaxy S23/S24). Zero horizontal scroll or clipped elements.
- **Native Android APK:** Production-ready APK compiled with Kotlin, Jetpack Compose, edge-to-edge display, and cookie-synchronized WebView.
- **Progressive Web App (PWA):** Installable on iOS (Safari Add-to-Home-Screen) and Android (Chrome Install App) with standalone app shell.

### 🛡️ Enterprise Security & Multi-Tenancy
- **PostgreSQL Row-Level Security (RLS):** 17 isolated tables with strict tenant-isolation policies on every query.
- **AES-256-GCM Credential Encryption:** Third-party tokens (Postiz, social platform API keys) are encrypted at rest with random IVs and GCM authentication tags.
- **Zod Schema Validation:** Comprehensive runtime type-checking across all incoming requests and outgoing payloads.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT SURFACES                                      │
│  ┌───────────────────────────┐  ┌───────────────────────────┐  ┌────────────────────┐  │
│  │    Desktop & Tablet Web   │  │    Mobile Safari & Chrome │  │ Native Android APK │  │
│  │   (Next.js Server Shell)  │  │        (PWA Window)       │  │ (Compose+WebView)  │  │
│  └─────────────┬─────────────┘  └─────────────┬─────────────┘  └─────────┬──────────┘  │
└────────────────┼──────────────────────────────┼──────────────────────────┼─────────────┘
                 │                              │                          │
                 └───────────────────────┬──────┴──────────────────────────┘
                                         │ HTTPS / Cookie Auth
┌────────────────────────────────────────▼───────────────────────────────────────────────┐
│                               NEXT.JS 16 APP ROUTER (SSR)                              │
│                                                                                        │
│   ├── Edge Middleware Proxy (src/proxy.ts) ── Session Refresh & Protected Routes       │
│   ├── Health Check API (/api/health) ──────── Real-Time Telemetry & Status             │
│   ├── Auth Service (/api/auth/demo-login) ─── Instant 1-Click Cookie-Set Session       │
│   ├── AI Caption Generation Engine ────────── OpenAI GPT-4o Orchestration              │
│   └── Practice & Note APIs ────────────────── Zod Schema Ingress Validation            │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
┌───────────────────▼──────────────────┐   ┌──────────────────▼──────────────────────────┐
│         SUPABASE POSTGRESQL          │   │              EXTERNAL SERVICES              │
│  - 17 Relational Tables with RLS     │   │  - OpenAI GPT-4o Multi-Tone Engine          │
│  - Daily Heatmap Aggregation RPC     │   │  - Postiz Social Publishing Integration     │
│  - Auth Service & Session Management │   │  - Node.js AES-256-GCM Crypto Subsystem     │
│  - Media Storage Bucket for Assets   │   │  - Vercel Edge Global Content Delivery      │
└──────────────────────────────────────┘   └─────────────────────────────────────────────┘
```

---

## 📱 Android Mobile App (APK)

A pre-compiled native Android APK is bundled directly inside your repository and mirrored in your system downloads:

| Property | Details |
| :--- | :--- |
| **Package File** | `caption.apk` (and mirrored at `Downloads/CaptionAI.apk`) |
| **Package Identifier** | `com.captionai.app` |
| **Compile SDK** | Android 36 (Android 15+) |
| **Minimum SDK** | Android 24 (Android 7.0 Nougat+) |
| **Key Features** | Edge-to-edge system bar integration, persistent session cookies, instant pull-to-refresh, hardware acceleration |

### Installation Steps:
1. Copy or download `caption.apk` to your Android device (via WhatsApp, USB, or Google Drive).
2. Tap the file in your device's **Downloads** folder.
3. Tap **Install** (allow *Install from Unknown Sources* if prompted).
4. Launch **Caption AI** from your app drawer!

---

## 🌐 Progressive Web App (PWA)

Caption AI complies with W3C Web App Manifest standards (`/manifest.webmanifest`) and Apple Touch icons:

- **On Android (Google Chrome):**
  1. Visit **[saas-pikn.vercel.app](https://saas-pikn.vercel.app/)**.
  2. Tap the three dots `(⋮)` in the top right corner.
  3. Select **Install app** or **Add to Home screen**.
- **On iOS (Apple Safari):**
  1. Visit **[saas-pikn.vercel.app](https://saas-pikn.vercel.app/)** in Safari.
  2. Tap the **Share** button `(↑)`.
  3. Scroll down and tap **Add to Home Screen**.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.4.3 (Turbopack)** | React 19, Server Components, App Router |
| **Styling** | **Custom Modern CSS Tokens** | Zero-dependency responsive design, CSS variables, glassmorphism |
| **Language** | **TypeScript 5.0** | Strict type safety across database schemas, APIs, and components |
| **Database & Auth** | **Supabase (PostgreSQL 15)** | Row-Level Security (RLS), daily aggregation RPC, Auth sessions |
| **AI Synthesis** | **OpenAI GPT-4o** | Clinical persona adaptation, voice emulation, guardrail checks |
| **Encryption** | **Node.js `crypto`** | AES-256-GCM authenticated credential encryption at rest |
| **Validation** | **Zod 4.6** | Runtime type verification on incoming and outgoing payloads |
| **Mobile App** | **Kotlin & Jetpack Compose** | Native Android container with auto-refreshing CookieManager |
| **Testing** | **Node.js Native Test Runner** | 20 unit, schema, cryptographic, and timezone tests |

---

## 🚦 Getting Started (Local Development)

### Prerequisites
- Node.js 20+ (LTS recommended)
- Git installed

### 1. Clone & Install
```bash
git clone https://github.com/08DevashishSrivastava/SAAS.git
cd SAAS/caption-ai
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
```
*(The repository already includes zero-config defaults for instant local development and live testing).*

### 3. Seed Demo Data (Idempotent)
```bash
npm run seed:demo
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Automated Testing & Verification

All core subsystems are thoroughly tested:

```bash
# 1. Run unit, security, and schema tests (20/20 passing)
npm test

# 2. Run TypeScript strict type-checker
npm run typecheck

# 3. Run ESLint code quality scan
npm run lint

# 4. Compile optimized production build (all 24 routes)
npm run build
```

### Tested Modules:
- `tests/unit/encryption.test.mts`: Validates AES-256-GCM encryption roundtrips, IV uniqueness, and authentication tag tampering prevention.
- `tests/unit/validation.test.mts`: Ensures rigorous Zod schema constraints on authentication, practice profiles, captions, and AI payloads.
- `tests/unit/streaks.test.mts`: Covers streak logic across leap days, year boundaries, timezones, and heatmap bucket distributions.

---

## 🔌 API Reference

| Route | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | Real-time system health, database latency, and auth telemetry. |
| `/api/auth/demo-login` | `GET, POST` | Public | Instant 1-click cookie-authenticated demo session creation. |
| `/api/practices` | `GET, POST` | Authenticated | List all owned practices or create a new clinical profile. |
| `/api/practices/[id]/captions` | `GET, POST` | Authenticated | Fetch draft captions or save newly finalized social posts. |
| `/api/practices/[id]/captions/generate` | `POST` | Authenticated | Generate voice-grounded captions using OpenAI GPT-4o. |
| `/api/practices/[id]/notes` | `GET, POST` | Authenticated | Manage practice knowledge-bank entries and clinical updates. |
| `/api/captions/[id]/schedule` | `POST` | Authenticated | Schedule post publishing across connected social channels. |
| `/api/dashboard/metrics` | `GET` | Authenticated | Aggregated streak counts, draft statistics, and 365-day heatmap. |

---

## 📄 License & Maintainer

Designed and engineered by **Devashish Srivastava** ([@08DevashishSrivastava](https://github.com/08DevashishSrivastava)).  
*Proprietary healthcare SaaS software. All rights reserved.*
