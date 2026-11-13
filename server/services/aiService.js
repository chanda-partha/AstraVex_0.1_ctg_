// AI Service - Google Gemini AI Engine & Grounded NASA Knowledge Resolver
import { buildCuratedQuizPayload, shuffleQuestionOptions } from '../data/missionQuizzes.js';
import {
  VERIFIED_NASA_MISSIONS,
  SUBSYSTEM_REGISTRY,
  resolveHardwareForMission,
} from './nasaRegistry.js';

const GEMINI_MODEL_PRIORITY = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

function sanitizePromptField(raw, maxLen = 120) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\r\n\t\x00-\x1F\x7F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function resolveServerGroundedContext(contextData) {
  const missionId = sanitizePromptField(contextData?.mission?.id, 40).toLowerCase();
  const hardwareId = sanitizePromptField(contextData?.hardware?.id, 48).toLowerCase();
  const destToken = sanitizePromptField(contextData?.destination, 24);

  const mission =
    VERIFIED_NASA_MISSIONS.find((m) => m.id.toLowerCase() === missionId) ||
    (destToken
      ? VERIFIED_NASA_MISSIONS.find(
          (m) => m.destination.toLowerCase() === destToken.toLowerCase()
        )
      : null) ||
    VERIFIED_NASA_MISSIONS[0];

  const hardware =
    (hardwareId ? resolveHardwareForMission(mission, hardwareId) : null) ||
    mission.hardware[0];

  return {
    destination: mission.destination,
    mission,
    hardware,
  };
}

async function callGeminiFast(prompt, geminiKey, { timeoutMs = 6000, json = false } = {}) {
  let authErrorStatus = null;
  for (const model of GEMINI_MODEL_PRIORITY) {
    try {
      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        ...(json ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
      };
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(timeoutMs),
          body: JSON.stringify(body),
        }
      );
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        authErrorStatus = res.status;
        break;
      }
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 5) {
          return { text: text.trim(), model, authErrorStatus: null };
        }
      }
    } catch (_) {
      // Transient timeout or network issue; fall through to next model
    }
  }
  return { text: null, model: null, authErrorStatus };
}

export async function generateStory(nasaData) {
  const mission = nasaData.mission;
  const hardware = nasaData.hardware;
  const rawDest = nasaData.destination || mission.destination || "Mars";
  const theater = rawDest === 'Moon' ? 'Moon' : rawDest === 'Mars' ? 'Mars' : 'DeepSpace';
  const displayDest = theater === 'Moon' ? 'the Moon' : theater === 'Mars' ? 'Mars' : 'deep space orbit';
  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();

  if (geminiKey.length > 15) {
    const prompt = `Write an inspiring, scientifically accurate NASA mission story in strict JSON format for explorers (ages 10-18).
STRICT RULE: Keep all facts strictly inside the ${theater} theater. Do NOT mix Moon missions with Mars facts or Mars missions with Moon facts.
Mission: ${mission.name} (${mission.agency})
Theater: ${theater} (${mission.locationName})
Launch Date: ${mission.launchDate} | Arrival/Commissioning: ${mission.landingDate}
Focused Hardware: ${hardware.name} (${hardware.type})
Purpose: ${hardware.purpose}
Scientific Function: ${hardware.scientificFunction}
Confirmed Contribution: ${mission.scientificContribution}

Return strictly valid JSON matching this schema:
{
  "title": "string",
  "subtitle": "string",
  "targetAgeGroup": "Space Explorers & Mission Specialists",
  "paragraphs": [
    { "heading": "1. Voyage Across the Cosmos", "content": "..." },
    { "heading": "2. Precision Spacecraft Hardware", "content": "..." },
    { "heading": "3. Groundbreaking Scientific Discoveries", "content": "..." },
    { "heading": "4. Legacy Beyond Earth", "content": "..." }
  ],
  "funFacts": ["fact 1", "fact 2", "fact 3"]
}`;
    try {
      const geminiRes = await callGeminiFast(prompt, geminiKey, { timeoutMs: 8000, json: true });
      if (geminiRes?.text) {
        const parsed = JSON.parse(geminiRes.text);
        if (
          parsed &&
          typeof parsed.title === 'string' &&
          Array.isArray(parsed.paragraphs) &&
          parsed.paragraphs.length >= 2 &&
          Array.isArray(parsed.funFacts)
        ) {
          return parsed;
        }
      }
    } catch (_) {
      // Fall back to deterministic grounded narrative
    }
  }

  const transitNarrative =
    theater === 'Moon'
      ? `On ${mission.launchDate}, ${mission.agency} launched the ${mission.name} mission from Earth, crossing roughly 384,400 kilometers of cislunar space over ~3 days to reach ${mission.locationName} on ${mission.landingDate}.`
      : theater === 'Mars'
        ? `On ${mission.launchDate}, ${mission.agency} launched the ${mission.name} mission aboard an interplanetary transfer trajectory spanning tens of millions of kilometers to arrive at ${mission.locationName} on Mars on ${mission.landingDate}.`
        : `On ${mission.launchDate}, ${mission.agency} lofted the ${mission.name} spacecraft beyond Earth's atmosphere, deploying into operational configuration at ${mission.locationName} (${mission.landingDate}).`;

  const story = {
    title: `The Story of ${hardware.name}`,
    subtitle: `${mission.name} · ${mission.locationName}`,
    targetAgeGroup: "Space Explorers & Mission Specialists",
    paragraphs: [
      {
        heading: "1. Voyage & Arrival",
        content: transitNarrative
      },
      {
        heading: "2. Precision Spacecraft Hardware",
        content: `At the heart of this expedition is ${hardware.name}. Built by engineers at ${mission.agency}, its primary mission is: "${hardware.purpose}". With a verified status of "${hardware.status}", it operates specialized instruments including ${Array.isArray(hardware.instruments) ? hardware.instruments.join(', ') : (hardware.instruments || 'precision flight sensors')}.`
      },
      {
        heading: "3. Groundbreaking Scientific Discoveries",
        content: `Working inside ${displayDest}, ${hardware.name} expanded human knowledge dramatically. ${hardware.scientificFunction} Thanks to its observations, scientists confirmed: ${mission.scientificContribution}`
      },
      {
        heading: "4. Legacy Beyond Earth",
        content: `Every laser pulse, spectrograph reading, and Deep Space Network packet sent back by ${hardware.name} lays the foundation for humanity's next giant leaps across ${displayDest} and beyond.`
      }
    ],
    funFacts: [
      `Operating Zone: ${mission.locationName} (${mission.coordinates?.lat || 0}°, ${mission.coordinates?.lon || 0}°)`,
      `Confirmed Status: ${mission.nasaConfirmedStatus}`,
      `Key Payload: ${Array.isArray(hardware.instruments) ? hardware.instruments.slice(0, 2).join(' & ') : (hardware.instruments || 'Scientific Payload')}`
    ]
  };

  return story;
}

export async function answerChat(userMessage, contextData, clientApiKey) {
  const cleanMsg = sanitizePromptField(userMessage, 1200);
  if (!cleanMsg) {
    return { answer: "Hello! How can I help you today?", source: "AstraVex Mission Context Engine" };
  }

  const grounded = resolveServerGroundedContext(contextData);
  const { mission, hardware, destination: dest } = grounded;

  const systemPrompt = `You are Google Gemini, an aerospace & planetary science AI assistant embedded inside the "AstraVex NASA Mission Explorer" 3D space application.

Active Grounded NASA Mission Context:
- Active Theater: ${dest}
- Mission: ${mission.name} (${mission.agency})
- Operating Site: ${mission.locationName}
- Active Hardware: ${hardware?.name || 'Onboard Scientific Payload'} (${hardware?.type || 'Spacecraft Subsystem'})

INSTRUCTIONS:
- Prioritize verified NASA mission specifications and planetary physics when discussing hardware or destinations.
- Give clear, helpful, accurate, well-structured answers using bolding, bullet points, and markdown.`;

  const geminiKey = sanitizePromptField(clientApiKey || process.env.GEMINI_API_KEY || "", 128);
  let geminiErrorStatus = null;

  if (geminiKey && geminiKey.length > 15) {
    const geminiResult = await callGeminiFast(
      `${systemPrompt}\n\nUSER QUESTION: "${cleanMsg}"`,
      geminiKey,
      { timeoutMs: 6500 }
    );
    if (geminiResult.text) {
      return {
        answer: geminiResult.text,
        source: `Google Gemini AI (${geminiResult.model})`,
      };
    }
    geminiErrorStatus = geminiResult.authErrorStatus;
  }

  const groundedReply = resolveGroundedNasaKnowledge(cleanMsg, dest, mission, hardware);
  return {
    ...groundedReply,
    ...(geminiErrorStatus ? { geminiErrorStatus } : {}),
  };
}

function resolveGroundedNasaKnowledge(userQuery, dest, mission, hardware) {
  const lowerQuery = userQuery.toLowerCase();

  // 1. Active NASA Hardware Context
  if (
    hardware &&
    (lowerQuery.includes('hardware') ||
      lowerQuery.includes('important') ||
      lowerQuery.includes('purpose') ||
      lowerQuery.includes('instrument') ||
      (hardware.name && lowerQuery.includes(hardware.name.toLowerCase())))
  ) {
    const formattedInstruments = Array.isArray(hardware.instruments)
      ? hardware.instruments.join(', ')
      : hardware.instruments || 'High-precision Sensors';

    return {
      answer: `🔍 **${hardware.name || 'NASA Hardware'} · ${mission?.name || dest}:**

• **Primary Purpose:** ${hardware.purpose || 'Exploration and scientific discovery'}
• **Scientific Capabilities:** ${hardware.scientificFunction || 'Surface/orbital investigation'}
• **Instruments Onboard:** ${formattedInstruments}
• **Status:** ${hardware.status || 'Active'} at ${mission?.locationName || 'Verified NASA Site'}.
• **Mission Contribution:** ${mission?.scientificContribution || 'Advancing space exploration.'}`,
      source: "AstraVex Offline NASA Knowledge Engine",
    };
  }

  // 2. Match against any verified NASA mission or registered subsystem
  const matchedMission = VERIFIED_NASA_MISSIONS.find(
    (m) =>
      lowerQuery.includes(m.id.toLowerCase()) ||
      lowerQuery.includes(m.name.toLowerCase().split('(')[0].trim().toLowerCase())
  );
  if (matchedMission) {
    const hwSummary = (matchedMission.hardware || [])
      .slice(0, 3)
      .map((h) => `• **${h.name}:** ${h.purpose}`)
      .join('\n');
    return {
      answer: `🛰️ **${matchedMission.name}** (${matchedMission.agency})

• **Theater & Site:** ${matchedMission.destination} — ${matchedMission.locationName}
• **Launch / Arrival:** ${matchedMission.launchDate} → ${matchedMission.landingDate}
• **Confirmed Status:** ${matchedMission.nasaConfirmedStatus}
• **Scientific Impact:** ${matchedMission.scientificContribution}

${hwSummary}`,
      source: "AstraVex Offline NASA Knowledge Engine",
    };
  }

  const matchedSubsystem = Object.values(SUBSYSTEM_REGISTRY).find(
    (sub) =>
      lowerQuery.includes(sub.id.toLowerCase()) ||
      lowerQuery.includes(sub.name.toLowerCase().split('(')[0].trim().toLowerCase())
  );
  if (matchedSubsystem) {
    return {
      answer: `⚙️ **${matchedSubsystem.name}** (${matchedSubsystem.type})

• **Function:** ${matchedSubsystem.purpose}
• **Engineering Details:** ${matchedSubsystem.scientificFunction}
• **Key Sensors:** ${(matchedSubsystem.instruments || []).join(', ')}
• **Operational Status:** ${matchedSubsystem.status}`,
      source: "AstraVex Offline NASA Knowledge Engine",
    };
  }

  // 3. Human Spaceflight Milestones
  if (
    lowerQuery.includes('first person') ||
    lowerQuery.includes('first human') ||
    lowerQuery.includes('yuri gagarin') ||
    lowerQuery.includes('apollo 11') ||
    lowerQuery.includes('neil armstrong')
  ) {
    return {
      answer: `👨‍🚀 **Milestones in Human Space Exploration:**

• **First Human in Space:** **Yuri Gagarin** launched on **April 12, 1961** aboard *Vostok 1*.
• **First Woman in Space:** **Valentina Tereshkova** on **June 16, 1963** aboard *Vostok 6*.
• **First Human on the Moon:** NASA astronaut **Neil Armstrong** on **July 20, 1969** during *Apollo 11*.
• **First American in Space:** **Alan Shepard** on **May 5, 1961** in *Freedom 7*.`,
      source: "AstraVex Offline NASA Knowledge Engine",
    };
  }

  // 4. Theater-grounded summary fallback (strictly honest attribution)
  const theaterNote =
    dest === 'Moon'
      ? 'Solar illumination extremes (+120°C to -170°C at the equator; cryogenic 25K cold traps at Shackleton Crater) and collisionless exosphere (~3 × 10⁻¹⁰ Pa).'
      : dest === 'Mars'
        ? 'Thin 95.3% CO₂ atmosphere (~610 Pa, <1% Earth pressure) with Marsquakes, global dust storms, and ancient Jezero/Gale delta sediments.'
        : 'Deep-space orbital environment using passive Kapton sunshields, cryocoolers, and Deep Space Network X/Ka-band uplinks.';

  return {
    answer: `🛰️ **AstraVex Offline Mission Brief · ${mission.name}**

No live Gemini API response was available for *"${userQuery}"*, so here is the verified NASA context currently loaded for **${hardware?.name || mission.name}**:

• **Operating Zone (${dest}):** ${mission.locationName}
• **Environment:** ${theaterNote}
• **Active Hardware Role:** ${hardware?.purpose || mission.purpose}
• **Key Instruments:** ${Array.isArray(hardware?.instruments) ? hardware.instruments.join(', ') : mission.scientificContribution}

Add a valid **Google Gemini API Key** in ⚙️ Settings to unlock free-form multimodal Q&A across any external topic.`,
    source: "AstraVex Offline NASA Knowledge Engine",
  };
}

export async function generateQuiz(nasaData, options = {}) {
  const mission = nasaData.mission;
  const hardware = nasaData.hardware;
  const roundSeed = Number(options.roundSeed) || Date.now();
  const curatedFallback = buildCuratedQuizPayload(nasaData, roundSeed);
  const theater = curatedFallback.destination || 'Mars';
  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();

  if (geminiKey.length > 15 && options.forceFresh) {
    const prompt = `Create a challenging 5-question multiple-choice science & engineering quiz strictly grounded in verified NASA facts.
STRICT THEATER ISOLATION RULE:
- Active Theater: ${theater}
- NEVER mention Mars craters/volcanoes (e.g., Olympus Mons, Valles Marineris, Jezero Crater) in Moon or DeepSpace questions or distractors!
- NEVER mention Lunar Apollo sites (e.g., Tranquility Base, Shackleton Crater) in Mars questions or distractors!
- Plausible distractors must come strictly from plausible ${theater} concepts.

Mission: ${mission.name} (${mission.agency})
Location / Orbit: ${mission.locationName}
Arrival / Launch: ${mission.landingDate}
Focused Hardware: ${hardware.name} (${hardware.type}, Status: ${hardware.status})
Purpose: ${hardware.purpose}
Scientific Function: ${hardware.scientificFunction}
Instruments: ${Array.isArray(hardware.instruments) ? hardware.instruments.join(', ') : (hardware.instruments || 'Scientific Payload')}

Return strictly valid JSON matching:
{
  "quizTitle": "${mission.name} — Mission Certification",
  "destination": "${theater}",
  "specialtyBadge": "${curatedFallback.specialtyBadge || `${theater} Specialist`}",
  "questions": [
    {
      "id": "q1",
      "topic": "Engineering | Planetary Science | Flight History | Orbital Physics | Astrophysics",
      "difficulty": "Cadet | Specialist | Flight Director",
      "question": "string",
      "options": ["opt0", "opt1", "opt2", "opt3"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ]
}`;
    try {
      const geminiRes = await callGeminiFast(prompt, geminiKey, { timeoutMs: 8000, json: true });
      if (geminiRes?.text) {
        const parsed = JSON.parse(geminiRes.text);
        if (
          parsed &&
          Array.isArray(parsed.questions) &&
          parsed.questions.length >= 4 &&
          parsed.questions.every(
            (q) =>
              typeof q.question === 'string' &&
              Array.isArray(q.options) &&
              q.options.length === 4 &&
              typeof q.correctIndex === 'number' &&
              q.correctIndex >= 0 &&
              q.correctIndex < 4
          )
        ) {
          return {
            quizTitle: parsed.quizTitle || `${mission.name} — Mission Certification`,
            destination: theater,
            missionId: mission.id,
            specialtyBadge: parsed.specialtyBadge || curatedFallback.specialtyBadge,
            roundSeed,
            questions: parsed.questions.slice(0, 5).map((q, idx) =>
              shuffleQuestionOptions({
                id: q.id || `gemini-${mission.id}-${idx + 1}`,
                topic: q.topic || 'Planetary Science',
                difficulty: q.difficulty || 'Specialist',
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation || mission.scientificContribution,
              })
            ),
          };
        }
      }
    } catch (_) {
      // Fall back cleanly to curated bank
    }
  }

  return curatedFallback;
}

// -------------------------------------------------------------
// 🛸 ELON — AI Space Mission Guide Engine
// -------------------------------------------------------------
export async function answerElon(userMessage, visitorName = "Explorer", stage = "general", contextData = null, clientApiKey = null) {
  const cleanMsg = sanitizePromptField(userMessage, 1200);
  const safeName = sanitizePromptField(visitorName, 48) || "Explorer";
  const safeStage = sanitizePromptField(stage, 32) || "general";
  const grounded = resolveServerGroundedContext(contextData);
  const { destination: dest, mission, hardware } = grounded;

  // Dedicated ELON System Prompt
  const elonSystemPrompt = `You are ELON, the official intelligent AI spacecraft mission guide onboard ASTRAVEX (NASA Mission Explorer).
Personality:
- Intelligent, confident, calm, friendly, and professional.
- Futuristic spacecraft AI speaking in natural conversational English with cinematic Hollywood narration.
- Knowledgeable about astronomy, NASA missions, and planetary science (Moon, Mars, Deep Space).
- You address the explorer respectfully by their name: "${safeName}".
- Strictly adhere to verified NASA scientific discoveries; never invent false discoveries.
- Keep responses concise, engaging, and suitable for spoken voice delivery (2 to 4 sentences).

Active Context:
- Explorer Name: ${safeName}
- Current Stage: ${safeStage}
- Destination: ${dest}
- Active Mission: ${mission?.name || 'Perseverance Rover'}
- Active Hardware: ${hardware?.name || 'SuperCam Spectrometer'}`;

  const geminiKey = sanitizePromptField(clientApiKey || process.env.GEMINI_API_KEY || "", 128);

  if (geminiKey && geminiKey.length > 15) {
    const geminiResult = await callGeminiFast(
      `${elonSystemPrompt}\n\nUSER INPUT: "${cleanMsg}"\nRespond as ELON in 2-3 cinematic sentences addressing ${safeName}:`,
      geminiKey,
      { timeoutMs: 6500 }
    );
    if (geminiResult.text) {
      return {
        reply: geminiResult.text,
        source: `ELON AI (Gemini ${geminiResult.model})`,
      };
    }
  }

  // 2. High-Fidelity Grounded Fallback Engine for ELON Stages
  if (stage === 'welcome') {
    return {
      reply: "Greetings, explorer. I am ELON, your artificial intelligence mission guide. Welcome to ASTRAVEX. Beyond the boundaries of Earth lies an endless universe filled with mysteries waiting to be discovered. Your journey beyond Earth begins here.",
      source: "ELON Core Subsystem"
    };
  }

  if (stage === 'ask_name') {
    return {
      reply: "Before we begin our journey, may I know your name?",
      source: "ELON Core Subsystem"
    };
  }

  if (stage === 'greeting') {
    return {
      reply: `Hello, ${safeName}! Welcome aboard. It's wonderful to have you here. How are you today? I hope you're doing great. The universe is full of extraordinary mysteries waiting to be discovered. From the ancient craters of our Moon to the vast landscapes of Mars, there is so much waiting for us to explore. Are you ready for an extraordinary journey?`,
      source: "ELON Core Subsystem"
    };
  }

  if (stage === 'space_intro') {
    return {
      reply: `Space exploration represents humanity's greatest endeavor. Through ASTRAVEX, you have direct access to verified NASA missions—from Apollo's historic lunar footprints to the nuclear-powered Perseverance rover drilling in Jezero Crater. Every rover, lander, and spectrometer here is modeled directly on real scientific hardware.`,
      source: "ELON Core Subsystem"
    };
  }

  if (stage === 'mission_brief') {
    return {
      reply: `Commander ${safeName}, your mission briefing is ready. Where shall we travel today? Would you like to explore the Moon, discover the mysteries of Mars, or explore the Solar System?`,
      source: "ELON Core Subsystem"
    };
  }

  // General Questions to ELON
  const lower = cleanMsg.toLowerCase();
  if (lower.includes('moon')) {
    return {
      reply: `${safeName}, the Moon is Earth's only natural satellite, situated 384,400 kilometers away. From Apollo 11's Tranquility Base to the upcoming Artemis III crewed polar landing, our lunar exploration reveals the deep volcanic history of our solar system.`,
      source: "ELON Telemetry Guide"
    };
  }

  if (lower.includes('mars') || lower.includes('perseverance')) {
    return {
      reply: `${safeName}, Mars is an extraordinary world of red iron oxide dust and ancient river deltas. NASA's Perseverance rover and Ingenuity helicopter are actively searching for signs of ancient microbial life in Jezero Crater as we speak!`,
      source: "ELON Telemetry Guide"
    };
  }

  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('elon')) {
    return {
      reply: `I am ELON, the onboard artificial intelligence flight director of ASTRAVEX. My mission is to assist and guide you, ${safeName}, as we navigate real NASA hardware and interplanetary scientific data across space.`,
      source: "ELON Telemetry Guide"
    };
  }

  return {
    reply: `Commander ${safeName}, telemetry received. ASTRAVEX is standing by for your commands. Select a destination or ask any question about our active spacecraft and planetary science.`,
    source: "ELON Telemetry Guide"
  };
}
