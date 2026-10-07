import express from 'express';
import { generateStory, answerChat, generateQuiz } from '../services/aiService.js';
import { resolveNasaData } from '../services/nasaDataResolver.js';

const router = express.Router();

// Generate educational AI story grounded in NASA data
router.post('/story', async (req, res) => {
  try {
    const { destination, mission, hardware } = req.body;
    const nasaData = await resolveNasaData(destination, mission, hardware);
    const story = await generateStory(nasaData);
    res.json({ status: "success", story, sourceAttribution: nasaData.sourceAttribution });
  } catch (error) {
    console.error("AI Story generation error:", error);
    res.status(500).json({ error: "Failed to generate AI story", details: error.message });
  }
});

// Context-aware AI Chatbot response
router.post('/chat', async (req, res) => {
  try {
    const { message, contextData, apiKey } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const response = await answerChat(message, contextData, apiKey);
    res.json({ status: "success", reply: response.answer, source: response.source });
  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: "Failed to get AI chat response", details: error.message });
  }
});

// Generate AI Science Quiz grounded in NASA data
router.post('/quiz', async (req, res) => {
  try {
    const { destination, mission, hardware } = req.body;
    const nasaData = await resolveNasaData(destination, mission, hardware);
    const quiz = await generateQuiz(nasaData);
    res.json({ status: "success", quiz });
  } catch (error) {
    console.error("AI Quiz generation error:", error);
    res.status(500).json({ error: "Failed to generate AI quiz", details: error.message });
  }
});

export default router;
