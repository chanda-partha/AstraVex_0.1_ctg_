/**
 * MISSION AFTERLIFE — Quiz Service
 * Generates mission-specific quiz questions.
 * Uses the AI backend when available; falls back to hardcoded verified questions.
 */

import type { AIQuizPayload, QuizQuestion } from '../../types';
import type { MAMissionData, MAQuizContext } from '../../types/missionAfterlife';
import { fetchAIQuiz } from '../api';

// ─────────────────────────────────────────────────────────────────
// Local Fallback Quiz Bank — verified facts from mission data
// ─────────────────────────────────────────────────────────────────

const FALLBACK_QUIZ_BANK: Record<string, QuizQuestion[]> = {
  apollo11: [
    {
      id: 'a11_q1',
      question: 'On what date did Apollo 11\'s Eagle lunar module first land on the Moon?',
      options: ['July 16, 1969', 'July 20, 1969', 'July 21, 1969', 'July 24, 1969'],
      correctIndex: 1,
      explanation: 'Eagle landed at Tranquility Base on July 20, 1969, at 20:17 UTC — seven years after President Kennedy\'s challenge to reach the Moon by the end of the decade.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'a11_q2',
      question: 'What is the current status of the Eagle descent stage at Tranquility Base?',
      options: [
        'It was deliberately crashed into the Moon after the mission',
        'It was collected and returned to Earth',
        'It still sits on the lunar surface where it was left in 1969',
        'Its location is unknown — no photographs have been taken'
      ],
      correctIndex: 2,
      explanation: 'The Eagle descent stage remains at Tranquility Base. NASA\'s Lunar Reconnaissance Orbiter confirmed it in 2009 and 2011, photographing the descent stage, equipment, and even the astronaut footpath trails.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'a11_q3',
      question: 'Which scientific instrument deployed by Apollo 11 is still being used by scientists today?',
      options: ['The Passive Seismic Experiment', 'The Laser Ranging Retroreflector', 'The Solar Wind Composition experiment', 'The Cosmic Ray Detector'],
      correctIndex: 1,
      explanation: 'The Laser Ranging Retroreflector (LRRR) deployed at Tranquility Base is still used by observatories worldwide. By bouncing laser pulses off it, scientists measure that the Moon is receding from Earth at approximately 3.8 centimetres per year.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'a11_q4',
      question: 'How much lunar material did Neil Armstrong and Buzz Aldrin collect during the Apollo 11 EVA?',
      options: ['2.1 kilograms', '21.55 kilograms', '77 kilograms', '110 kilograms'],
      correctIndex: 1,
      explanation: 'The Apollo 11 crew collected 21.55 kilograms of lunar material — primarily mare basalt from the Sea of Tranquility. These samples have been studied for over 50 years and helped confirm the Giant Impact Hypothesis for the Moon\'s formation.',
      healthReward: 10,
      healthPenalty: 10,
    },
  ],

  apollo15: [
    {
      id: 'a15_q1',
      question: 'What was historically significant about the Lunar Roving Vehicle used on Apollo 15?',
      options: [
        'It was the first vehicle ever used on another world',
        'It was driven remotely from Earth without astronauts',
        'It was powered by nuclear energy',
        'It was the fastest vehicle ever built for space exploration'
      ],
      correctIndex: 0,
      explanation: 'LRV-1 on Apollo 15 was the first wheeled vehicle ever driven on another world, on July 31, 1971. Its electric motors and pressurized tires allowed the crew to explore far beyond walking range of the lunar module.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'a15_q2',
      question: 'What important discovery did the Apollo 15 crew make during their traverse of the Hadley-Apennine region?',
      options: [
        'Evidence of microbial life in the soil',
        'The "Genesis Rock" — a 4.1 billion year old anorthosite from the original lunar crust',
        'Underground water ice deposits',
        'A previously unknown meteorite impact structure'
      ],
      correctIndex: 1,
      explanation: 'The "Genesis Rock" (sample 15415) is an anorthosite approximately 4.1 billion years old, nearly as old as the Moon itself. It provided direct evidence that the Moon originally had a magma ocean covering its entire surface.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'a15_q3',
      question: 'What experiment did David Scott perform that demonstrated Galileo\'s hypothesis in a live television broadcast?',
      options: [
        'The Hammer and Feather drop experiment, proving all objects fall equally in a vacuum',
        'Growing crystals in zero gravity',
        'Measuring the Moon\'s magnetic field directly',
        'Testing whether water boils at a lower temperature in low gravity'
      ],
      correctIndex: 0,
      explanation: 'David Scott dropped a geological hammer and a falcon feather simultaneously and both hit the ground at the same moment — proving that in a vacuum, all objects fall at the same rate regardless of mass, confirming Galileo\'s 1638 hypothesis for a worldwide television audience.',
      healthReward: 10,
      healthPenalty: 10,
    },
  ],

  apollo17: [
    {
      id: 'a17_q1',
      question: 'Who was the last human being to stand on the Moon?',
      options: ['Neil Armstrong', 'Buzz Aldrin', 'Harrison Schmitt', 'Gene Cernan'],
      correctIndex: 3,
      explanation: 'Gene Cernan, Commander of Apollo 17, was the last person to step off the lunar surface, on December 14, 1972. His final words were: "We leave as we came and, God willing, as we shall return, with peace and hope for all mankind." As of 2026, he remains the last human to walk on the Moon.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'a17_q2',
      question: 'What scientifically significant discovery did Harrison Schmitt make during Apollo 17\'s EVA-2?',
      options: [
        'A frozen underground lake',
        'Bright orange volcanic glass soil near Shorty Crater',
        'A piece of a metallic asteroid',
        'Evidence of recent volcanic eruption within 10,000 years'
      ],
      correctIndex: 1,
      explanation: 'Harrison Schmitt discovered bright orange soil near Shorty Crater — later identified as ancient volcanic glass beads approximately 3.64 billion years old, evidence of an ancient pyroclastic eruption. Recent analysis confirmed these beads contain water molecules, evidence of a water-rich volcanic interior.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'a17_q3',
      question: 'Apollo 17 had a unique launch characteristic. What was it?',
      options: [
        'It launched from the Moon, not Earth',
        'It was the first and only nighttime launch of a Saturn V rocket',
        'It launched with six crew members instead of three',
        'It was launched without any astronauts on board'
      ],
      correctIndex: 1,
      explanation: 'Apollo 17\'s Saturn V launched at 12:33 AM EST on December 7, 1972 — the first and only nighttime launch of the entire Apollo program. The rocket\'s 7.5 million pounds of thrust lit up the Florida coast and was visible from more than 800 kilometres away.',
      healthReward: 10,
      healthPenalty: 10,
    },
  ],

  viking1: [
    {
      id: 'v1_q1',
      question: 'What event caused Viking 1 to lose communication with Earth in 1982?',
      options: [
        'A meteorite struck the lander and destroyed its antenna',
        'A software command intended to extend antenna life corrupted the system instead',
        'A global Martian dust storm buried the lander completely',
        'The RTG power source ran out of plutonium fuel'
      ],
      correctIndex: 1,
      explanation: 'On November 13, 1982, a software upload intended to extend the life of the lander\'s antenna-pointing mechanism instead corrupted the system, causing the antenna to tilt away from Earth. Contact was never re-established.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'v1_q2',
      question: 'What controversial result did Viking 1\'s biology experiments produce?',
      options: [
        'They definitively confirmed the presence of living microorganisms',
        'They detected organic molecules in the soil',
        'The Labeled Release experiment produced results consistent with both biological and chemical explanations',
        'They proved Mars had no water in any form'
      ],
      correctIndex: 2,
      explanation: 'The Labeled Release (LR) experiment produced a burst of CO2 when nutrients were added to Martian soil — a result that looked like a biological response. However, the Gas Chromatograph-Mass Spectrometer found no organic molecules, leading most scientists to attribute the result to reactive chemical oxidants. The debate continues.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'v1_q3',
      question: 'How long did Viking 1 operate on the Martian surface beyond its original 90-day mission?',
      options: [
        'It lasted exactly 90 days as designed',
        'It lasted 6 months',
        'It lasted over 6 years — 2,245 Martian sols',
        'It lasted 20 years before its final failure'
      ],
      correctIndex: 2,
      explanation: 'Viking 1 operated for 2,245 Martian sols — over six Earth years — far exceeding its design lifetime. It monitored Martian weather, atmospheric chemistry, and surface conditions continuously until the November 1982 communication failure.',
      healthReward: 10,
      healthPenalty: 10,
    },
  ],

  spirit: [
    {
      id: 'sp_q1',
      question: 'What caused Spirit\'s mission to end?',
      options: [
        'A global dust storm blocked all sunlight from its solar panels',
        'Its wheels sank into soft soil and it could not reposition solar panels for winter',
        'A meteorite struck and disabled the rover',
        'Its computer suffered an irreparable hardware failure'
      ],
      correctIndex: 1,
      explanation: 'In May 2009, Spirit\'s wheels broke through a thin soil crust near "Troy" and sank into soft material. It could not maneuver to position its solar panels optimally for the Martian winter. As temperatures dropped and solar power fell below survival levels, Spirit went silent on March 22, 2010.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'sp_q2',
      question: 'What scientifically important discovery did Spirit\'s damaged wheel accidentally make?',
      options: [
        'It uncovered fossilized microorganism structures beneath the surface',
        'It exposed bright, nearly white siliceous soil — evidence of ancient hydrothermal water activity',
        'It revealed a buried metallic meteorite',
        'It found ice just centimetres below the surface'
      ],
      correctIndex: 1,
      explanation: 'Spirit\'s broken right front wheel dragged through the soil rather than rolling, exposing bright siliceous soil beneath. This material could only form through hydrothermal water activity — hot water interacting with minerals. It was one of the most significant discoveries of Spirit\'s entire mission.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'sp_q3',
      question: 'How much longer did Spirit operate than its original planned mission?',
      options: ['Exactly as planned — 90 Martian sols', '3 times longer', '10 times longer', 'Approximately 25 times longer — 2,208 Martian sols'],
      correctIndex: 3,
      explanation: 'Spirit was designed to operate for 90 Martian sols. It actually operated for 2,208 Martian sols — approximately 25 times longer than its warranty — before its last communication on March 22, 2010.',
      healthReward: 10,
      healthPenalty: 10,
    },
  ],

  opportunity: [
    {
      id: 'op_q1',
      question: 'What scientific evidence did Opportunity find in Eagle Crater shortly after landing?',
      options: [
        'Ancient frozen ice preserved in the bedrock',
        'Layered sedimentary rock that could only have formed in liquid water',
        'Signs of active volcanic activity beneath the surface',
        'Carbon compounds indicating biological activity'
      ],
      correctIndex: 1,
      explanation: 'The walls of Eagle Crater exposed layered sedimentary rock — material that absolutely required liquid water to deposit. This was one of the first definitive confirmations that the Meridiani region of Mars had once been covered in liquid water.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'op_q2',
      question: 'What event caused Opportunity to cease operations in June 2018?',
      options: [
        'Its wheels became permanently trapped in sand dunes',
        'A global Martian dust storm blocked all sunlight from its solar panels',
        'Its computer memory was completely exhausted',
        'Its communication antenna was destroyed by a wind gust'
      ],
      correctIndex: 1,
      explanation: 'A planetary-scale dust storm in June 2018 — one of the most severe ever recorded — reduced sunlight to less than 1% of normal levels at Meridiani Planum. Opportunity\'s solar-powered batteries drained completely. Its last signal was received on June 10, 2018.',
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: 'op_q3',
      question: 'How far did Opportunity travel across the Martian surface in its 15-year mission?',
      options: ['7.73 kilometres', '12 kilometres', '28.4 kilometres', '45.16 kilometres'],
      correctIndex: 3,
      explanation: 'Opportunity drove 45.16 kilometres — a planetary surface distance record for any robotic vehicle operating outside Earth. It surpassed the previous record held by the Soviet Lunokhod 2 lunar rover and drove from its landing site all the way to the ancient Endeavour Crater.',
      healthReward: 10,
      healthPenalty: 10,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Main Quiz Generation Function
// ─────────────────────────────────────────────────────────────────

export async function generateMissionAfterlifeQuiz(
  missionData: MAMissionData,
  signal?: AbortSignal
): Promise<AIQuizPayload> {
  const { id, name, destination, spacecraftName } = missionData;

  try {
    // Attempt AI-generated quiz via the existing backend
    const aiQuiz = await fetchAIQuiz(destination, id, spacecraftName, signal);

    // If we got a valid AI quiz with questions, use it
    if (aiQuiz && aiQuiz.questions && aiQuiz.questions.length >= 3) {
      return {
        ...aiQuiz,
        quizTitle: `Mission Afterlife: ${name} Knowledge Evaluation`,
      };
    }
  } catch {
    // AI unavailable or aborted — fall through to local fallback
  }

  // Local fallback: verified questions from mission data
  const fallbackQuestions = FALLBACK_QUIZ_BANK[id] || generateGenericFallback(missionData);

  return {
    quizTitle: `Mission Afterlife: ${name} Knowledge Evaluation`,
    destination,
    questions: fallbackQuestions,
  };
}

// Generate a minimal generic fallback if a mission has no hardcoded quiz
function generateGenericFallback(mission: MAMissionData): QuizQuestion[] {
  return [
    {
      id: `${mission.id}_gen_q1`,
      question: `When did ${mission.name} arrive at its destination?`,
      options: [
        mission.landingDate || mission.launchDate,
        '1965-01-01',
        '2000-06-15',
        '1990-03-22'
      ],
      correctIndex: 0,
      explanation: `${mission.name} ${mission.landingDate ? `landed on ${mission.landingDate}` : `launched on ${mission.launchDate}`}, beginning its exploration of ${mission.destination}.`,
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: `${mission.id}_gen_q2`,
      question: `What is the current status of the ${mission.spacecraftName}?`,
      options: [
        mission.hardwareStatus,
        'Operational — still sending data',
        'Returned to Earth',
        'Deliberately destroyed'
      ],
      correctIndex: 0,
      explanation: mission.hardwareStatusDetail,
      healthReward: 10,
      healthPenalty: 10,
    },
    {
      id: `${mission.id}_gen_q3`,
      question: `Where did ${mission.name} land on ${mission.destination}?`,
      options: [
        mission.locationName,
        'Olympus Mons',
        'Valles Marineris',
        'Hellas Planitia'
      ],
      correctIndex: 0,
      explanation: `${mission.name} landed at ${mission.locationName}${mission.coordinates ? ` (${Math.abs(mission.coordinates.lat).toFixed(2)}°${mission.coordinates.lat >= 0 ? 'N' : 'S'}, ${mission.coordinates.lon.toFixed(2)}°E)` : ''}.`,
      healthReward: 10,
      healthPenalty: 10,
    },
  ];
}

