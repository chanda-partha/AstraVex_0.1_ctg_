# NASA Mission Explorer — API Reference

Documentation of all backend endpoints, schemas, caching parameters, and client services.

---

## 1. Base URL & Configuration

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:5000/api` (proxied by Vite at `http://localhost:3000/api`) |
| Unified Production | `/api` (served directly by Express on port 5000 or `$PORT`) |
| Standalone Static | Automatically falls back to verified client payload store |

---

## 2. API Endpoints

### `GET /api/health`
Verifies backend service availability and connectivity status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "app": "NASA Mission Explorer Backend API",
  "timestamp": "2026-10-06T12:00:00.000Z",
  "nasaApis": "Online",
  "aiEngine": "Ready"
}
```

---

### `GET /api/nasa/resolve`
Resolves mission hardware metadata, coordinates, specs, and real NASA photography.

**Query Parameters:**
- `destination` (string, required): `'Mars'` or `'Moon'`.
- `mission` (string, required): e.g. `'perseverance'`, `'curiosity'`, `'apollo11'`, `'chandrayaan3'`.
- `hardware` (string, required): e.g. `'supercam'`, `'moxie'`, `'eagle-descent-stage'`, `'vikram-lander'`.

**Response Schema:**
```json
{
  "timestamp": "2026-10-06T12:00:00.000Z",
  "destination": "Mars",
  "mission": {
    "id": "perseverance",
    "name": "Mars 2020 Perseverance Rover",
    "destination": "Mars",
    "locationName": "Jezero Crater",
    "coordinates": { "lat": 18.44, "lon": 77.45 },
    "launchDate": "July 30, 2020",
    "landingDate": "February 18, 2021",
    "status": "Operational",
    "agency": "NASA / JPL",
    "hardware": [ ... ]
  },
  "hardware": {
    "id": "supercam",
    "name": "SuperCam Laser & Remote Micro-Imager",
    "type": "Remote Optical & Laser Spectrometer",
    "purpose": "Remote mineralogy, elemental chemistry, and sound recording...",
    "scientificFunction": "Laser-induced breakdown spectroscopy (LIBS)...",
    "status": "Operational",
    "instruments": ["Laser Spectrometer", "Micro-Imager", "Microphone"]
  },
  "images": [
    {
      "title": "SuperCam Calibration Target on Mars",
      "description": "High-resolution calibration target imaged on Sol 15...",
      "nasaId": "PIA24484",
      "imageUrl": "https://images-assets.nasa.gov/image/PIA24484/PIA24484~medium.jpg"
    }
  ],
  "sourceAttribution": {
    "agency": "NASA / JPL-Caltech",
    "dataset": "NASA Image and Video Library & Mars Rover Photos API",
    "retrievedAt": "2026-10-06T12:00:00.000Z",
    "license": "Public Domain (NASA Guidelines)"
  }
}
```

---

### `POST /api/ai/story`
Generates an educational narrative dossier using Gemini or cached verified fallback.

**Request Body:**
```json
{
  "destination": "Mars",
  "mission": "perseverance",
  "hardware": "supercam"
}
```

**Response (200 OK):**
```json
{
  "story": {
    "title": "SuperCam: The Laser Eye of Mars",
    "subtitle": "Zapping Rocks on the Red Planet from 20 Feet Away",
    "targetAgeGroup": "Middle School Explorers",
    "paragraphs": [
      {
        "heading": "The Laser-Blasting Geologist",
        "content": "Perseverance carries a mast with a camera that shoots a laser beam..."
      }
    ],
    "funFacts": [
      "Can vaporize small rock patches up to 7 meters (23 feet) away.",
      "Recorded the first audio sounds of wind on Mars."
    ]
  }
}
```

---

### `POST /api/ai/quiz`
Generates an interactive 3-question scientific flight specialist evaluation.

**Request Body:**
```json
{
  "destination": "Mars",
  "mission": "perseverance",
  "hardware": "supercam"
}
```

---

### `POST /api/ai/chat`
Context-aware planetary flight assistant answering student inquiries.

**Request Body:**
```json
{
  "message": "Why does Perseverance need a laser?",
  "apiKey": "optional_override_key",
  "contextData": {
    "destination": "Mars",
    "mission": "perseverance",
    "hardware": "supercam"
  }
}
```
