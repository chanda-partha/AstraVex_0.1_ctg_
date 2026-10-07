# 🚀 AstraVex — NASA Mission Explorer

> **"Explore. Discover. Learn."**  
> *Official Competition Prototype for the NASA Space Apps Challenge 2026*  
> 🚀 Immersive 3D space exploration web app for the NASA Space Apps Challenge 2026. Explore NASA rovers, landers & telescopes across Mars, the Moon & deep space, powered by live NASA APIs, Three.js, React 18, and Gemini AI storytelling.

---

## 🌟 1. Project Overview

**AstraVex (NASA Mission Explorer)** is an immersive 3D web application designed to introduce school-age space enthusiasts to the hardware and science NASA has left across the solar system (Moon, Mars, and deep space).

Rather than reading flat articles, users enter a cinematic 3D space environment where they launch from Earth, travel through interplanetary space, land on alien terrain, and physically explore 3D NASA rovers, landers, and scientific instruments grounded in live NASA Open Data APIs.

---

## 🔬 2. NASA Space Apps Challenge Problem Addressed

> *"Since the 1960s, NASA has left hardware across the solar system–on the Moon, on Mars, and in deep space... Your challenge is to tell the story of some or all of this equipment that introduces school-age space enthusiasts to the hardware and the science it made possible."*

### Key Features Addressed:
1. **Historic & Active NASA Hardware**: Perseverance Rover, SuperCam Laser, MOXIE Oxygen Generator, Ingenuity Helicopter, Curiosity Rover, SAM Analytical Lab, InSight Seismometer, Apollo 11 Eagle Lunar Module.
2. **NASA Open Data Integration**: Real-time querying of official NASA APIs (`images-api.nasa.gov`, `api.nasa.gov/mars-photos`, `data.nasa.gov`) with full source attribution.
3. **AI Storytelling Engine**: Educational narratives grounded strictly in verified NASA dataset payloads.
4. **AI Text-to-Speech (TTS) Voice Narrator**: Web Speech API audio narrator with Play, Pause, Stop, and Volume controls.
5. **Context-Aware AI Chatbot**: Interactive space guide answering student questions based on the active planet, mission, and hardware context.
6. **AI Science Quiz & Gamification**: Interactive multi-choice quizzes with explanations, confetti rewards, and **Health (HP)** mechanics (+10 HP for correct answers, -15 HP for solar radiation events).

---

## 🏗️ 3. System Architecture

```text
USER INTERFACE (3D WebGL Web App)
       ↓
React 18 + TypeScript + Three.js / React Three Fiber + Drei + Tailwind CSS
       ↓
Express Backend API (Port 5000)
       ↓
┌───────────────────────────┬───────────────────────────┐
│     NASA Data Resolver    │     Grounded AI Engine    │
├───────────────────────────┼───────────────────────────┤
│ • NASA Image & Video API  │ • Educational Narrator    │
│ • Mars Rover Photos API   │ • Contextual AI Chat      │
│ • NASA Open Data Registry │ • Interactive Science Quiz│
└───────────────────────────┴───────────────────────────┘
```

---

## 🛠️ 4. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Three.js, `@react-three/fiber`, `@react-three/drei`, Tailwind CSS, Lucide React, Framer Motion, Canvas Confetti.
- **Backend**: Node.js, Express, CORS, Dotenv.
- **NASA Data**: Official NASA APIs (`images-api.nasa.gov`, `api.nasa.gov`, `data.nasa.gov`).
- **Voice / Speech**: Web Speech API (`window.speechSynthesis`).

---

## 🚀 5. Installation & Local Development Instructions

### Prerequisites:
- Node.js (v18+) and npm installed.

### Step 1: Install Dependencies
Run in project root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables (Optional)
Create a `.env` file in the `server` directory or project root:
```env
PORT=5000
NASA_API_KEY=DEMO_KEY
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 3: Run Server & Client Locally
From project root:
```bash
# Terminal 1: Run Express API Server (Port 5000)
cd server
npm run dev

# Terminal 2: Run Client Vite Dev Server (Port 3000)
cd client
npm run dev
```

Open your browser to: **`http://localhost:3000`**

---

## 📡 6. Registered NASA APIs & Datasets Used

| Source Name | Type | URL | Purpose |
|-------------|------|-----|---------|
| **NASA Image & Video Library** | REST API | `https://images-api.nasa.gov` | Real high-res photographs & mission captions |
| **NASA Mars Rover Photos API** | REST API | `https://api.nasa.gov/mars-photos` | Rover Sol camera imagery |
| **NASA Open Data Portal** | Dataset Registry | `https://data.nasa.gov` | Hardware catalogs & instrument payload specs |
| **NASA APOD API** | REST API | `https://api.nasa.gov/planetary/apod` | Daily astronomy imagery & editorial summaries |

---

## 🏆 7. Acceptance Criteria & Demo Results

- [x] **3D Space Homepage**: Cinematic Three.js scene with rotating Earth, Moon, Mars, starfield particles, and Explore trigger.
- [x] **Destination Selection**: Interactive 3D planetary globes for Moon and Mars.
- [x] **Earth Launch & Space Travel**: Launch countdown, travel warp, and in-flight Solar Flare event choices affecting Health.
- [x] **Planetary Landing**: Atmospheric entry, parachute deployment, retro-rockets, and touchdown sequence.
- [x] **3D Exploration Site**: Interactive terrain with 3D Rover model and clickable hardware hotspots (SuperCam, MOXIE, Ingenuity, Seismometer).
- [x] **Real NASA Data & Images**: Verified NASA specs and live imagery carousel with official NASA Source Panel.
- [x] **AI Storytelling & Voice**: Multi-paragraph educational story with browser Text-to-Speech narration controls.
- [x] **Context-Aware AI Chatbot**: Floating assistant answering questions strictly grounded in active mission context.
- [x] **AI Science Quiz**: Multiple-choice quiz with explanations, health rewards (+10 HP), and confetti.

---

## 📄 License
Public Domain / NASA Space Apps Challenge 2026 Submission.
