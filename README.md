# 🚀 AstraVex (NASA Mission Explorer)

> **"Explore. Discover. Learn."**  
> *Engineering Prototype for the NASA Space Apps Challenge*  
> Interactive 3D mission exploration across **3 isolated planetary theaters** (**The Moon**, **Mars**, and **Deep Space & Orbital**), backed by real J2000 & Vis-Viva orbital ephemeris, 18 authentic NASA/international missions, custom GLB & procedural 3D hardware, and live NASA Open Data APIs.

---

## 1. NASA Space Apps Challenge Alignment & Theater Architecture

Rather than mixing lunar, Martian, and deep-space craft together, **AstraVex** enforces a strict **5-stage engineering journey** (`Home → Mission Select → Launch & Ascent → Entry/Descent/Orbit Capture → 3D Exploration`) isolated cleanly across three theaters:

1. **Lunar Theater (`Moon` · 9 Missions)**: Artemis III Starship HLS, Apollo 11, Apollo 15 (LRV), Apollo 17, Chandrayaan-3 (Vikram & Pragyan), Chang'e 4 (Yutu-2), Surveyor 3, LRO, and LADEE.
2. **Martian Theater (`Mars` · 5 Missions)**: Perseverance & Ingenuity, Curiosity (MSL), InSight, Viking 1, and Mars Reconnaissance Orbiter (MRO).
3. **Deep Space & Orbital Theater (`DeepSpace` · 4 Missions)**: James Webb Space Telescope (JWST at Sun–Earth L2), Hubble Space Telescope (535 km LEO), International Space Station (408 km LEO), and Voyager 1 (165+ AU Interstellar).

---

## 2. Aerospace Engineering Highlights

- **Vehicle-Accurate Launch & Ascent Simulator ([LaunchVehicle3DSimulator.tsx](file:///f:/astravex/client/src/components/3d/LaunchVehicle3DSimulator.tsx))**: Instead of replaying mismatched launch clips, each mission launches on its authentic rocket stack (**Saturn V**, **SLS Block 1**, **ISRO LVM3-M4**, **Long March 3B**, **Ariane 5 ECA**, **Space Shuttle Discovery**, **Titan IIIE-Centaur**, **Atlas V 541/401**, **Falcon 9**) with interactive fairing separation, booster staging, Mach-diamond engine plumes, and live NASA Image & Video Library archive lookup (`/api/nasa/videos`).
- **Stage-Accurate EDL vs. Orbit Insertion ([LandingPage.tsx](file:///f:/astravex/client/src/pages/LandingPage.tsx))**: Surface landers/rovers render their own 3D craft descent (**Vikram**, **Starship HLS**, **Apollo LM**, **Yutu-2**, **InSight**, **Viking**, **Curiosity**, **Perseverance**), while orbital spacecraft (**MRO**, **LRO**, **LADEE**) execute **Mars/Lunar Orbit Insertion (`MOI / LOI`)** and aerobraking above the 3D planetary globe.
- **Astrodynamics & Ephemeris Engine ([liveTelemetryEngine.js](file:///f:/astravex/server/services/liveTelemetryEngine.js), [liveTelemetry.ts](file:///f:/astravex/client/src/utils/liveTelemetry.ts))**:
  - Standish JPL **J2000 Keplerian solver** (5 Newton-Raphson iterations) for instantaneous Earth–Mars separation and one-way light delay.
  - **Vis-Viva orbital equation** $v = \sqrt{\mu(2/r - 1/a)}$ for LEO & lunar/Martian orbiters (`ISS`, `Hubble`, `MRO`, `LRO`, `LADEE`).
  - **CRTBP Sun–Earth L2 halo modulation** (`180-day` period) for `JWST` (`1.36M–1.63M km`).
- **Theater-Isolated Interactive Science Lab ([ScienceSimulatorsModal.tsx](file:///f:/astravex/client/src/components/simulators/ScienceSimulatorsModal.tsx))**: 11 interactive physics experiments (SuperCam LIBS, MOXIE electrolysis, InSight SEIS marsquakes, Ingenuity thin-air rotor, Apollo LRRR, Chandrayaan-3 ChaSTE thermal probe, Apollo/Yutu-2 traverse radar, JWST IR redshift, Voyager heliopause, Keplerian orbital mechanics) + **90-question curated evaluation bank**.
- **Open-Data Observability & Security ([server.js](file:///f:/astravex/server/server.js), [NasaDataRegistryModal.tsx](file:///f:/astravex/client/src/components/data/NasaDataRegistryModal.tsx))**: Live upstream status badges (`Live API`, `Cached TTL`, `Computed fallback`), Julian Date & orbital element diagnostics, per-IP AI rate limiting, security headers, and strict zero-auth privacy design.

---

## 3. Running Locally & Verification

### Development
```bash
# Terminal 1: Express API Server (port 5000)
cd server && npm install && npm run dev

# Terminal 2: Vite + React + Three.js Client (port 3000)
cd client && npm install && npm run dev
```

### Verification & Production Build
```bash
# Run full NASA-grade test suite (Fallbacks, Cinematic Rules, J2000/Vis-Viva Physics, API Contracts)
npm test

# TypeScript check + Vite bundle + sync to production/
npm run build
```

---

## 4. Registered NASA Open Data Sources

| Source | Endpoint | Purpose |
| :--- | :--- | :--- |
| **NASA Image & Video Library** | `https://images-api.nasa.gov` | Mission photography, PIA archive metadata, & archival video streams |
| **NASA Mars Rover Photos API** | `https://api.nasa.gov/mars-photos/api/v1` | Live Curiosity & Perseverance Sol manifests & total downlinked photo counts |
| **Where The ISS At?** | `https://api.wheretheiss.at/v1/satellites/25544` | Real-time ISS sub-orbital coordinates & orbital velocity |
| **NASA DONKI & APOD** | `https://api.nasa.gov/DONKI` & `/planetary/apod` | Solar weather space alerts & daily astronomy photography |
| **JPL Ephemeris / Open Data** | `https://ssd.jpl.nasa.gov` & `https://data.nasa.gov` | J2000 orbital elements, instrument hardware specifications |
