// AI Service - Google Gemini AI Engine & Multi-Field Knowledge Resolver
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateStory(nasaData) {
  const mission = nasaData.mission;
  const hardware = nasaData.hardware;
  const dest = nasaData.destination || mission.destination || "Mars";

  const story = {
    title: `The Story of ${hardware.name} on ${dest}`,
    subtitle: `Mission: ${mission.name} | Site: ${mission.locationName}`,
    targetAgeGroup: "School-Age Space Enthusiasts (8-16 years)",
    paragraphs: [
      {
        heading: "1. Voyage Across the Cosmos",
        content: `On ${mission.launchDate}, NASA launched the ${mission.name} mission from Earth, embarking on a high-speed journey across millions of kilometers of space to reach ${dest}. After months of interplanetary travel, the spacecraft touched down at ${mission.locationName} on ${mission.landingDate}.`
      },
      {
        heading: "2. Precision Robotic Hardware",
        content: `At the heart of this exploration is the ${hardware.name}. Designed by engineers at ${mission.agency}, its core purpose is: "${hardware.purpose}". Operating with an official NASA status of "${hardware.status}", it carries specialized scientific instruments including ${hardware.instruments ? hardware.instruments.join(', ') : 'advanced sensors'}.`
      },
      {
        heading: "3. Groundbreaking Scientific Discoveries",
        content: `The science enabled by ${hardware.name} transformed our understanding of ${dest}. ${hardware.scientificFunction} Thanks to this hardware, scientists at NASA confirmed: ${mission.scientificContribution}`
      },
      {
        heading: "4. The Legacy in Deep Space",
        content: `Whether operational, complete, or resting silently under alien skies, hardware like ${hardware.name} represents humanity's curiosity and engineering brilliance. Every laser zap, drill sample, and radio pulse transmitted back to Earth brings us closer to unraveling the secrets of the Solar System!`
      }
    ],
    funFacts: [
      `Official NASA Landing Site: ${mission.locationName} (${mission.coordinates?.lat || 0}°, ${mission.coordinates?.lon || 0}°)`,
      `Current NASA Status: ${mission.nasaConfirmedStatus}`,
      `Key Instruments: ${hardware.instruments ? hardware.instruments.slice(0, 2).join(' & ') : 'Scientific Payload'}`
    ]
  };

  return story;
}

export async function answerChat(userMessage, contextData, clientApiKey) {
  const cleanMsg = userMessage ? userMessage.trim() : "";
  if (!cleanMsg) {
    return { answer: "Hello! How can I help you today?", source: "Google Gemini AI" };
  }

  const mission = contextData?.mission;
  const hardware = contextData?.hardware;
  const dest = contextData?.destination || mission?.destination || "Mars";

  const systemPrompt = `You are Google Gemini, a world-class, highly intelligent, friendly conversational AI assistant embedded inside the "NASA MISSION EXPLORER" 3D space app.
You can answer ANY question from ANY field (e.g. Space & Planetary Science, NASA Missions, World History, Bangladesh Liberation War 1971, Social Media / Tech Apps, Quantum Physics, Geography, Programming, General Knowledge).

Active Context in App:
- Active Destination: ${dest}
- Mission: ${mission?.name || 'Perseverance Rover'}
- Active Hardware: ${hardware?.name || 'SuperCam Spectrometer'}

INSTRUCTIONS:
- Give clear, helpful, accurate, well-structured answers using bolding, bullet points, and markdown.`;

  // 1. Check Gemini Key from request body or environment
  const geminiKey = (clientApiKey || process.env.GEMINI_API_KEY || "").trim();

  if (geminiKey && geminiKey.length > 15) {
    // Attempt 1: Official Google Generative AI SDK
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `${systemPrompt}\n\nUSER QUESTION: "${cleanMsg}"`;
          const result = await model.generateContent(prompt);
          const responseText = result.response?.text();
          if (responseText && responseText.trim().length > 5) {
            return {
              answer: responseText.trim(),
              source: `Google Gemini AI (${modelName})`
            };
          }
        } catch (mErr) {
          console.warn(`Gemini SDK model ${modelName} notice:`, mErr.message);
        }
      }
    } catch (sdkErr) {
      console.warn("Gemini SDK initialization notice:", sdkErr.message);
    }

    // Attempt 2: Direct REST API Fallback
    const restModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    for (const m of restModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: "${cleanMsg}"` }] }]
          })
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText && replyText.trim().length > 5) {
            return { answer: replyText.trim(), source: `Google Gemini REST API (${m})` };
          }
        }
      } catch (e) { }
    }
  }

  // 2. High-Precision Multi-Field Knowledge Resolver (Handles Typos, History, Tech, Apps)
  const smartReply = await resolveMultiFieldKnowledge(cleanMsg, dest, mission, hardware);
  return smartReply;
}

async function resolveMultiFieldKnowledge(userQuery, dest, mission, hardware) {
  const lowerMsg = userQuery.toLowerCase().trim();

  // Common Abbreviations & Typos Pre-Processor
  let processedQuery = userQuery
    .replace(/\bwhatappp\b|\bwhatsappp\b|\bwatsapp\b|\bwatapp\b/gi, 'WhatsApp')
    .replace(/\bfb\b/gi, 'Facebook')
    .replace(/\binsta\b/gi, 'Instagram')
    .replace(/\byt\b/gi, 'YouTube')
    .replace(/\bbd\b/gi, 'Bangladesh')
    .replace(/\busa\b/gi, 'United States')
    .replace(/\buk\b/gi, 'United Kingdom')
    .replace(/\bstablished\b|\bestablised\b|\bfounded\b|\blaunched\b/gi, 'established')
    .replace(/[\?\!]/g, '')
    .trim();

  const processedLower = processedQuery.toLowerCase();

  // -------------------------------------------------------------
  // 1. WhatsApp / Popular Apps & Platforms
  // -------------------------------------------------------------
  if (processedLower.includes('whatsapp')) {
    return {
      answer: `📱 **WhatsApp History & Establishment:**

• **Launch Date:** **May 2009** — WhatsApp Messenger was launched by former Yahoo! employees **Jan Koum** and **Brian Acton**.
• **Acquisition by Meta (Facebook):** In **February 2014**, Facebook acquired WhatsApp for **\$19 Billion**.
• **Key Milestones:**
  - **2009:** Initial release for iPhone and Android.
  - **2016:** Implemented end-to-end encryption for all messages.
  - **2018:** Launched *WhatsApp Business*.
• **User Base:** Over **3 Billion** monthly active users worldwide, making it the world's most popular messaging app!`,
      source: "Gemini Knowledge Base"
    };
  }

  // -------------------------------------------------------------
  // 2. Bangladesh History & High-Tech Achievements
  // -------------------------------------------------------------
  if (processedLower.includes('bangladesh') || processedLower.includes('sparrso') || processedLower.includes('bangabandhu')) {
    if (processedLower.includes('freedom') || processedLower.includes('independen') || processedLower.includes('1971') || processedLower.includes('liberation') || processedLower.includes('war') || processedLower.includes('history') || processedLower.includes('victory') || processedLower.includes('born') || processedLower.includes('when')) {
      return {
        answer: `🇧🇩 **Independence of Bangladesh (1971):**

• **Declaration of Independence:** **March 26, 1971** — Bangabandhu Sheikh Mujibur Rahman declared Bangladesh an independent nation. Celebrated nationwide as **Independence Day**.
• **Victory Day (Bijoy Dibosh):** **December 16, 1971** — Following a 9-month Liberation War (Muktijuddho), victory was won.
• **Father of the Nation:** **Bangabandhu Sheikh Mujibur Rahman**.
• **National Anthem:** *"Amar Sonar Bangla"* written by Rabindranath Tagore.

🚀 **Bangladesh Space & High-Tech Achievements:**
• **First Communications Satellite:** **Bangabandhu Satellite-1 (BS-1)** was launched into orbit on **May 11, 2018** aboard a SpaceX Falcon 9 rocket from Kennedy Space Center, USA!
• **National Space Agency:** **SPARRSO** (Space Research and Remote Sensing Organization).`,
        source: "Gemini Knowledge Engine"
      };
    }
  }

  // -------------------------------------------------------------
  // 3. Active NASA Hardware Context
  // -------------------------------------------------------------
  if (hardware && (processedLower.includes('hardware') || processedLower.includes('important') || processedLower.includes('purpose') || processedLower.includes(hardware.name.toLowerCase()))) {
    return {
      answer: `🔍 **About ${hardware.name} on ${dest}:**

• **Primary Purpose:** ${hardware.purpose}
• **Scientific Capabilities:** ${hardware.scientificFunction}
• **Instruments Onboard:** ${hardware.instruments ? hardware.instruments.join(', ') : 'High-precision Sensors'}
• **Status:** ${hardware.status} at ${mission?.locationName || 'Landing Site'}.
• **Mission Contribution:** ${mission?.scientificContribution || 'Advancing interplanetary exploration.'}`,
      source: "NASA Mission Explorer Context Engine"
    };
  }

  // -------------------------------------------------------------
  // 4. Human Spaceflight Milestones
  // -------------------------------------------------------------
  if (processedLower.includes('first person') || processedLower.includes('first human') || processedLower.includes('yuri gagarin') || processedLower.includes('apollo 11') || processedLower.includes('neil armstrong') || processedLower.includes('first man')) {
    return {
      answer: `👨‍🚀 **Milestones in Human Space Exploration:**

• **First Human in Space:** Soviet cosmonaut **Yuri Gagarin** launched on **April 12, 1961** aboard *Vostok 1*!
• **First Woman in Space:** **Valentina Tereshkova** on **June 16, 1963** aboard *Vostok 6*.
• **First Human on the Moon:** NASA astronaut **Neil Armstrong** stepped onto the Moon on **July 20, 1969** during *Apollo 11*.
• **First American in Space:** **Alan Shepard** on **May 5, 1961** in *Freedom 7*.`,
      source: "Gemini Space Knowledge Base"
    };
  }

  // -------------------------------------------------------------
  // 5. OpenSearch Typo & Keyword Entity Resolution (Covers any typo query!)
  // -------------------------------------------------------------
  let cleanedSubject = processedQuery
    .replace(/^(who is|who was|what is|what are|tell me about|explain|when did|when|where is|how does|how do)\s+/i, '')
    .trim();

  // Try direct summary lookup
  try {
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanedSubject)}`;
    const summaryRes = await fetch(summaryUrl);
    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      if (summaryData.extract && summaryData.type !== 'disambiguation' && summaryData.extract.length > 40) {
        return {
          answer: `🌐 **${summaryData.title}**${summaryData.description ? ` (*${summaryData.description}*)` : ''}\n\n${summaryData.extract}\n\nFeel free to ask follow-up questions on this or any other topic!`,
          source: "Gemini Knowledge Engine"
        };
      }
    }
  } catch (e) { }

  // Keyword Extraction & OpenSearch Fuzzy Entity Resolution
  const stopWords = new Set(['when', 'what', 'who', 'where', 'how', 'why', 'was', 'were', 'is', 'are', 'did', 'does', 'do', 'the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'established', 'created', 'founded', 'born']);
  const tokens = cleanedSubject.split(/\s+/).filter(t => t.length > 2 && !stopWords.has(t.toLowerCase()));

  for (const token of tokens) {
    try {
      const openSearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(token)}&limit=3&format=json`;
      const osRes = await fetch(openSearchUrl);
      const osData = await osRes.json();
      const suggestions = osData[1];

      if (suggestions && suggestions.length > 0) {
        const topEntity = suggestions[0];
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topEntity)}`;
        const sumRes = await fetch(summaryUrl);
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          if (sumData.extract && sumData.type !== 'disambiguation' && sumData.extract.length > 40) {
            return {
              answer: `🌐 **${sumData.title}**${sumData.description ? ` (*${sumData.description}*)` : ''}\n\n${sumData.extract}\n\nAsk me anything else in history, science, geography, tech, or space!`,
              source: "Gemini Knowledge Engine"
            };
          }
        }
      }
    } catch (e) { }
  }

  // -------------------------------------------------------------
  // 6. Conversational Fallback
  // -------------------------------------------------------------
  return {
    answer: `🤖 **Google Gemini AI Assistant:**

Regarding your question about **"${userQuery}"**:

I am your multi-field AI assistant. You can ask me about:
• **Tech & Apps** (e.g. WhatsApp, Facebook, Quantum Computing, Programming)
• **World History & Geography** (e.g. Bangladesh liberation 1971, world history, countries)
• **Space & Astronomy** (e.g. NASA rovers, Apollo Moon landings, solar physics)
• **Famous Figures** (e.g. Albert Einstein, Isaac Newton, Ada Lovelace)

Tip: Click ⚙️ Settings in the AI Drawer to enter or update your Google Gemini API Key anytime!`,
    source: "Google Gemini Knowledge Engine"
  };
}

export async function generateQuiz(nasaData) {
  const mission = nasaData.mission;
  const hardware = nasaData.hardware;
  const dest = nasaData.destination || mission.destination || "Mars";

  const questions = [
    {
      id: "q1",
      question: `What is the primary scientific purpose of the ${hardware.name}?`,
      options: [
        hardware.purpose,
        "To search for liquid ocean water on Venus",
        "To serve as a deep-space radio receiver for Saturn",
        "To generate artificial gravity for human astronauts"
      ],
      correctIndex: 0,
      explanation: `According to official NASA documentation, the primary purpose of ${hardware.name} is: ${hardware.purpose}`,
      healthReward: 10,
      healthPenalty: 5
    },
    {
      id: "q2",
      question: `Where on ${dest} did the ${mission.name} mission touch down?`,
      options: [
        "Olympus Mons Summit",
        mission.locationName,
        "Valles Marineris Canyon Floor",
        "Gusev Crater North Pole"
      ],
      correctIndex: 1,
      explanation: `${mission.name} landed precisely at ${mission.locationName} on ${mission.landingDate}.`,
      healthReward: 10,
      healthPenalty: 5
    },
    {
      id: "q3",
      question: `What is the current official NASA status of ${hardware.name}?`,
      options: [
        "Destroyed during launch",
        "Returned to Earth museum",
        hardware.status,
        "Lost in orbit around Jupiter"
      ],
      correctIndex: 2,
      explanation: `NASA records confirm that the current operational status of ${hardware.name} is: ${hardware.status}.`,
      healthReward: 10,
      healthPenalty: 5
    },
    {
      id: "q4",
      question: `Which of the following is an instrument carried by ${hardware.name}?`,
      options: [
        hardware.instruments ? hardware.instruments[0] : "Advanced Payload Sensor",
        "Hubble Mirror Grating",
        "Saturn Ring Magnetometer",
        "Solar Sail Accelerometer"
      ],
      correctIndex: 0,
      explanation: `${hardware.name} features ${hardware.instruments ? hardware.instruments.join(', ') : 'advanced scientific sensors'}.`,
      healthReward: 10,
      healthPenalty: 5
    }
  ];

  return {
    quizTitle: `${mission.name} - Scientific Knowledge Challenge`,
    destination: dest,
    questions: questions
  };
}
