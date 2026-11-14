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

8. **External Data Upload & Tabular Audit (`Data Upload Tab`)**:
   - Ingests CSV/TSV files and pasted tabular data.
   - Handles messy column names (`PM2.5(ug/m3)`, `pm_25`, `no2`, etc.).
   - Issues data-quality warnings.
   - Strictly isolated with an explicit **"Uploaded Data (Non-API)"** tag to prevent mixing with live API streams.

---

## 3. APIs Integrated & Classification

| API / Dataset | Integration Status | Classification | Purpose |
|---|---|---|---|
| **Open-Meteo Air Quality API** | **Active (Primary)** | Model Estimate (CAMS) | Real-time PM2.5, PM10, NO2, SO2, CO, O3, US AQI, European AQI, 72h forecast |
| **Open-Meteo Geocoding API** | **Active (Primary)** | Spatial Reference | Dynamic city and coordinate search for Indian locations |
| **Google Gemini API** | **Active (Intelligence)** | Generative AI Layer | Structured civic intelligence analysis and recommendations grounded in API telemetry |

---

## 4. Setup & Running the Application

### Prerequisites
- Node.js 18+ (tested with Node.js v26)
- npm 9+

### 1. Environment Variables (Optional)
Create a `.env.local` file in the project root:
```env
# Optional: Google Gemini API key (defaults to deterministic grounded engine if omitted)
GEMINI_API_KEY="your-gemini-api-key"
```

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
