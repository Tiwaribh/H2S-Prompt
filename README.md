# AirSathi – Live Civic Air Intelligence | PromptWars MVP

> **"From live air quality data to local action."**

AirSathi is an API-driven civic intelligence dashboard built for the Google for Developers PromptWars challenge. It bridges live public atmospheric data, Google Gemini intelligence, and actionable municipal governance protocols across Indian cities.

---

## 1. Non-Negotiable Scientific Integrity

- **Zero Hardcoded Data**: AirSathi does **not** use static, hardcoded, or simulated AQI values or criteria pollutant levels.
- **Genuine Public APIs**: All telemetry is fetched live from Open-Meteo Air Quality API (backed by the European Centre for Medium-Range Weather Forecasts Copernicus Atmosphere Monitoring Service - ECMWF CAMS).
- **Clear Classification**: Open-Meteo values are explicitly disclosed as **atmospheric model estimates** (~11-40km grid cells).
- **No Ward-Level Hallucination**: Municipalities within the same model grid cell are not assigned fabricated neighborhood differences.
- **Strict Error Handling**: If an API is unreachable, the system displays a clear error state and explanation without silently substituting fake demo numbers.

---

## 2. Implemented Features

1. **Live Civic Dashboard (`/` & Overview Tab)**:
   - Real-time US AQI and European AQI scores.
   - Live Criteria Pollutants: PM2.5, PM10, Nitrogen Dioxide (NO2), Sulphur Dioxide (SO2), Carbon Monoxide (CO), and Ground-level Ozone (O3).
   - Dynamic location selector (Bhopal, Indore, Delhi, Mumbai, Bengaluru, Kolkata, Hyderabad, Ahmedabad, and custom coordinates).
   - Display of provider, retrieved timestamp, elevation, coordinates, and units (µg/m³).

2. **Real-time Geocoding Search (`/api/geocode`)**:
   - Live search across Indian cities using Open-Meteo Geocoding API.
   - Dynamic latitude and longitude input driving actual API telemetry.

3. **Multi-Location Intelligence & Trends (`Hotspots & Trends Tab`)**:
   - Real-time comparison across multiple Indian urban centers.
   - Identification of highest-risk locations and criteria pollutant dominance.
   - 48-hour historical reanalysis alongside 72-hour hourly forecast curves using Recharts.

4. **Data Intelligence Layer – Google Gemini (`/api/gemini`)**:
   - Structured JSON response (`executive_summary`, `overall_assessment`, `key_findings`, `trends`, `location_comparison`, `data_quality`, `priority_actions`, `health_advisory`).
   - Every finding cites exact real source values, units, timestamps, data provider, and model classification.
   - Integrated deterministic civic air engine fallback for offline/development operation.

5. **Stakeholder-Based Action Matrix (`Action Recommendations Tab`)**:
   - Functional stakeholder switcher:
     - **Ward Officer (Municipal)**: Mechanized road sweeping, anti-smog misting, C&D dust barriers, open burning vigilance.
     - **Housing Society (RWA)**: No-idling gate rules, wet mopping driveways, resident morning walk alerts.
     - **School Administrator**: Indoor physical education rescheduling, asthma registers, bus drop-off emission controls.
   - Every action cites live supporting data and realistic implementation timeframes without unwarranted claims of instant regional AQI reduction.

6. **Civic Briefings & Bilingual Citizen Advisory (`Generate Briefings Tab`)**:
   - **Internal Civic Briefing**: Technical and administrative protocol for municipal teams.
   - **Citizen Advisory**: Plain-language public health precautions.
   - Full bilingual support: **English** and **हिंदी (Hindi)**.
   - Reading level selector: **Simple Read** and **Standard**.
   - Export tools: One-click clipboard copy, `.txt` download, and printable HTML view.

7. **Previous Report Snapshots & Delta Comparison (`Previous Reports Tab`)**:
   - Persists telemetry snapshots to `localStorage`.
   - Comparative delta engine calculates changes in AQI and pollutants (+/- delta and % change).
   - Enforces compatible unit, provider, and measurement matching; never treats missing values as zero.

8. **Google-Only Authentication (Zero-Database Identity Verification)**:
   - **Single Sign-On**: Single "Continue with Google" button using Firebase Client Auth.
   - **Zero Database**: No database (Firestore, SQL, Mongo) is used. Identity is verified in-memory and persisted securely in client session storage (`browserLocalPersistence`).
   - **Route Protection**: Unauthenticated visitors are gated behind the login screen; all dashboard views and telemetry fetching remain protected until authenticated.
   - **User Profile Display**: Authenticated user's name and Google profile picture are displayed in the header with a one-click Sign Out option.

---

## 3. APIs Integrated & Classification

| API / Dataset | Integration Status | Classification | Purpose |
|---|---|---|---|
| **Open-Meteo Air Quality API** | **Active (Primary)** | Model Estimate (CAMS) | Real-time PM2.5, PM10, NO2, SO2, CO, O3, US AQI, European AQI, 72h forecast |
| **Open-Meteo Geocoding API** | **Active (Primary)** | Spatial Reference | Dynamic city and coordinate search for Indian locations |
| **Google Gemini API** | **Active (Intelligence)** | Generative AI Layer | Structured civic intelligence analysis and recommendations grounded in API telemetry |
| **Google OAuth (Firebase)** | **Active (Auth Gate)** | Identity Verification | Secure, zero-database authentication session handling |

---

## 4. Setup & Running the Application

### Prerequisites
- Node.js 18+ (tested with Node.js v26)
- npm 9+

### 1. Environment Configuration
Create a `.env.local` file in the project root:
```env
# Optional: Google Gemini API key (defaults to deterministic grounded engine if omitted)
GEMINI_API_KEY="your-gemini-api-key"

# Firebase Google OAuth Credentials (Client-side identity verification only)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

> **Note**: If Firebase credentials are not yet configured in `.env.local`, the application displays the AirSathi Design A login card with an interactive, copyable configuration guide explaining how to create a free Firebase Web App and enable Google Sign-In.

### 2. Install & Run
```bash
npm install
npm run build
npm start
```

Or for development:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.
