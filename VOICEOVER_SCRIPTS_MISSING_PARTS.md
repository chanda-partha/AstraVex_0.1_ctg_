# ElevenLabs Voiceover Scripts — Missing AstraVex Audio Files

Copy and paste each script below into **ElevenLabs**, save the exported audio using the exact filename shown above each block, and place all `.mp3` files into:

`client/public/sounds/`

Once you add the files to `client/public/sounds/`, let me know — I will inspect/analyze the audio durations & spoken phrases of all tracks (existing + new) and wire exact synced cue timestamps + UI spotlight targets into [`tourEngine.ts`](file:///f:/astravex/client/src/guide/tourEngine.ts).

---

## ElevenLabs Settings Recommendation
- **Voice**: Same calm NASA Mission Control / Science Narrator voice used for the original 18 files
- **Format**: MP3 (`44.1 kHz` / `128–192 kbps`)
- **Clarity / Stability**: Stability `0.55`, Similarity `0.78`, natural pacing (do not rush)
- **Important**: Copy ONLY the plain text inside each code box (exact UI button names are already preserved verbatim!).

---

## Part 1 — Deep Space & Orbital Stage Narration (3 Files)

### 1. `destination_deepspace.mp3`
*(Plays on Stage 2 when viewing Deep Space & Orbital — JWST, Hubble, ISS, Voyager 1)*

```text
Welcome to Deep Space and Orbital Command. Click any floating 3D spacecraft model or select an observatory from the list on the right. Then click Commence Expedition to fly the full launch and deployment sequence, or click Direct 3D Space to inspect the spacecraft right away.
```

---

### 2. `deep_space_launch.mp3`
*(Plays on Stage 3 Earth Launch for Deep Space missions)*

```text
Deep space launch sequence initiated. Track main engine ignition, payload fairing separation, core staging, and final orbital or escape injection along the flight timeline below. Whenever you are ready, click Proceed to Deployment.
```

---

### 3. `deep_space_deploy.mp3`
*(Plays on Stage 4 Spacecraft Deployment for Deep Space missions)*

```text
Orbital deployment and commissioning engaged. Monitor solar array unlocking, thermal sunshield tensioning, and optical calibration across all five deployment phases. Once commissioning is complete, click Explore 3D Spacecraft to begin your interactive inspection.
```

---

## Part 2 — Orbit Capture Track (Moon & Mars Orbiters) (1 File)

### 4. `orbit_capture.mp3`
*(Plays on Stage 4 for planetary orbiters: LRO, LADEE, MRO)*

```text
Planetary orbit insertion engaged. Follow the spacecraft as it aligns retrograde for its main capture burn, stabilizes its ellipse, and locks into a low-altitude science orbit. When orbit insertion is complete, click Explore Orbital Craft to inspect every onboard sensor in 3D.
```

---

## Part 3 — Deep Space & Orbital Spacecraft Briefings (4 Files)

### 5. `briefing_jwst.mp3`
*(Plays in Stage 5 3D Explorer for James Webb Space Telescope)*

```text
You are inspecting the James Webb Space Telescope, orbiting one point five million kilometers from Earth at the Sun-Earth L2 point. Click any glowing marker to explore its eighteen gold-coated beryllium mirror segments, five-layer Kapton sunshield, and cryo-cooled infrared instruments—or use Specs, Story, Lab, and Live data below.
```

---

### 6. `briefing_hubble.mp3`
*(Plays in Stage 5 3D Explorer for Hubble Space Telescope)*

```text
Orbiting five hundred and thirty-five kilometers above Earth since nineteen ninety, the Hubble Space Telescope transformed modern astronomy. Inspect its two-point-four-meter primary mirror, high-gain relay dishes, and camera bays in 3D, or open Live data for deep-field captures and real-time orbital pass telemetry.
```

---

### 7. `briefing_iss.mp3`
*(Plays in Stage 5 3D Explorer for International Space Station)*

```text
Circling Earth every ninety minutes at twenty-seven thousand six hundred kilometers per hour, the International Space Station is humanity's permanently crewed orbital laboratory. Inspect its pressurized research modules, solar wings, and thermal radiators, or open Live data to monitor its real-time altitude and orbital track.
```

---

### 8. `briefing_voyager.mp3`
*(Plays in Stage 5 3D Explorer for Voyager 1 Interstellar Probe)*

```text
More than one hundred and sixty-five astronomical units from Earth beyond the Sun's heliopause, Voyager 1 is humanity's farthest active spacecraft. Inspect its high-gain dish, plutonium power generators, thirteen-meter magnetometer boom, and the iconic Golden Record carrying Earth's story into interstellar space.
```

---

## Part 4 — Missing Moon & Mars Mission Briefings (9 Files)

### 9. `briefing_artemis3.mp3`
*(Plays in Stage 5 3D Explorer for Artemis III & Starship HLS)*

```text
Welcome to Shackleton Crater Rim near the lunar South Pole, destination for NASA's Artemis 3 human landing mission. Standing fifty meters tall, the Starship Human Landing System uses high-ring landing thrusters, solar arrays, and twin crew elevators to reach permanently shadowed craters holding water ice.
```

---

### 10. `briefing_chandrayaan3.mp3`
*(Plays in Stage 5 3D Explorer for Chandrayaan-3 Vikram & Pragyan)*

```text
You have arrived at Shiv Shakti Point near the lunar south pole, where ISRO's Chandrayaan-3 Vikram lander achieved a historic soft landing in twenty twenty-three. Inspect Vikram's thermal probe and seismometer alongside the solar-powered Pragyan rover deployed onto polar highland regolith.
```

---

### 11. `briefing_insight.mp3`
*(Plays in Stage 5 3D Explorer for NASA InSight Mars Lander)*

```text
You are inspecting NASA's stationary InSight lander on Elysium Planitia. By anchoring its dome-shielded SEIS seismometer directly onto the Martian surface, InSight recorded over thirteen hundred marsquakes to map the thickness of Mars's crust and confirm its liquid metallic core.
```

---

### 12. `briefing_viking.mp3`
*(Plays in Stage 5 3D Explorer for NASA Viking 1 Mars Lander)*

```text
Welcome to Chryse Planitia, where NASA's Viking 1 became the first spacecraft to operate long-term on Mars in nineteen seventy-six. Explore its dual panoramic cameras, weather boom, and automated soil sampling arm that performed the earliest life-detection experiments on the Martian surface.
```

---

### 13. `briefing_apollo15.mp3`
*(Plays in Stage 5 3D Explorer for Apollo 15 Hadley-Apennine)*

```text
Apollo 15 landed beside Hadley Rille and the towering Apennine Mountains in nineteen seventy-one. On this extended scientific expedition, astronauts David Scott and James Irwin drove the very first Lunar Roving Vehicle across twenty-eight kilometers of highland geology.
```

---

### 14. `briefing_apollo17.mp3`
*(Plays in Stage 5 3D Explorer for Apollo 17 Taurus-Littrow)*

```text
Nestled inside the deep volcanic valley of Taurus-Littrow, Apollo 17 marked the final crewed Apollo expedition to the Moon in nineteen seventy-two. Commander Gene Cernan and geologist Harrison Schmitt discovered famous orange pyroclastic glass beads erupted from deep within the lunar mantle.
```

---

### 15. `briefing_change4.mp3`
*(Plays in Stage 5 3D Explorer for Chang'e 4 & Yutu-2 Rover)*

```text
Inside Von Karman Crater on the lunar far side, Chang'e 4 and the Yutu-2 rover completed humanity's first soft landing hidden from Earth. Using ground-penetrating radar, Yutu-2 probes ancient impact ejecta layers inside the giant South Pole-Aitken Basin.
```

---

### 16. `briefing_surveyor3.mp3`
*(Plays in Stage 5 3D Explorer for Surveyor 3)*

```text
Surveyor 3 touched down inside a shallow crater in the Ocean of Storms in nineteen sixty-seven, digging lunar soil trenches with its robotic scoop to test surface strength for Apollo astronauts. Two years later, Apollo 12 astronauts Pete Conrad and Alan Bean walked into this exact crater to inspect it.
```

---

### 17. `briefing_ladee.mp3`
*(Plays in Stage 5 3D Explorer for NASA LADEE Lunar Orbiter)*

```text
NASA's LADEE orbiter skimmed low above the Moon's equator to measure its ultra-thin exosphere and electrically lofted lunar dust grains. Inspect its gold-anodized Lunar Laser Communication terminal, which proved high-speed laser broadband from lunar orbit back to Earth.
```

---

## Audit Note: UI Button Names Matched Against Existing 18 Voices

You noticed earlier that the Start Mission button did not match the existing voice! That was **true** — the original 18 `.mp3` voices spoke older button names (`Commence Expedition`, `Direct 3D Surface`, `Proceed to Landing`, `Explore 3D Surface`), whereas the UI had temporarily been renamed to `Begin mission` / `Skip to 3D` / `Continue to landing`.

I have updated the UI buttons to match your existing recordings cleanly:

| Stage / File | What Existing Voice Says | UI Button Text (Now Matched!) |
|---|---|---|
| `destination_moon.mp3`, `destination_mars.mp3` | `"click Commence Expedition"` | **`Commence Expedition`** (`DestinationPage.tsx`) |
| `destination_moon.mp3`, `destination_mars.mp3` | `"click Direct 3D Surface"` | **`Direct 3D Surface`** (`DestinationPage.tsx`, **`Direct 3D Space`** on Deep Space) |
| `earth_launch.mp3` | `"click Proceed to Landing"` | **`Proceed to Landing`** (`EarthLaunchPage.tsx`, **`Proceed to Deployment`** on Deep Space, **`Proceed to Orbit Capture`** on Orbiters) |
| `planetary_landing.mp3` | `"click Explore 3D Surface"` | **`Explore 3D Surface`** (`LandingPage.tsx`, **`Explore 3D Spacecraft`** on Deep Space, **`Explore Orbital Craft`** on Orbiters) |
| `surface_dock.mp3` | `"fire the onboard sensor"`, `"hardware specs"`, `"mission story"`, `"science quiz"` | Bottom dock: **`Scan`**, **`Live data`**, **`Specs`**, **`Story`**, **`Lab`**, **`Quiz`** |
| `welcome_home.mp3` | `"Choose the Moon... or Mars."` | Home panel shows **The Moon** & **Mars** only |

When you finish generating the new ElevenLabs `.mp3` files and put them inside `client/public/sounds/`, just reply here and I will analyze every voice file and sync all durations & cue highlights in [`tourEngine.ts`](file:///f:/astravex/client/src/guide/tourEngine.ts)!
