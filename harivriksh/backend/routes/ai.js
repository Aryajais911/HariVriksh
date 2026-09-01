const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const { optionalAuth } = require('../middleware/auth');

// Build concise plant knowledge from DB to inject as AI context
const buildPlantContext = async () => {
  try {
    const plants = await Plant.find().select(
      'name category difficulty harvestDays sunRequirement waterFrequency soilMix commonProblems benefits seasons tags compatibleContainers'
    );
    return plants.map(p => {
      const containers = p.compatibleContainers?.map(c => c.type).join(', ') || 'various';
      const problems = p.commonProblems?.map(pr => `${pr.problem}: ${pr.solution}`).join('; ') || 'none listed';
      return `${p.name} (${p.category}, ${p.difficulty} difficulty): harvest in ${p.harvestDays?.min}-${p.harvestDays?.max} days, needs ${p.sunRequirement} sun, water ${p.waterFrequency}. Compatible containers: ${containers}. Soil: ${p.soilMix?.recipe || 'standard'}. Problems & fixes: ${problems}. Benefits: ${p.benefits?.join(', ')}.`;
    }).join('\n');
  } catch {
    return 'Plant database unavailable.';
  }
};

const callClaude = async (systemPrompt, userMessage, history = [], maxTokens = 600) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set in .env file');
  }

  const messages = [
    ...history.slice(-10),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || 'No response generated.';
};

// ── POST /api/ai/chat ──────────────────────────────────────
// General-purpose farming chatbot with full plant DB context
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const plantKnowledge = await buildPlantContext();

    const systemPrompt = `You are "Kisaan Mitra" (Farmer's Friend), an expert AI assistant for HariVriksh — an urban rooftop farming platform for Indian homes.

Your expertise covers:
- Container gardening using household items (bottles, buckets, PVC pipes, grow bags, clay pots, trays)
- Growing vegetables, herbs, fruits, and flowers on Indian rooftops and balconies
- Organic, pesticide-free farming methods suitable for India
- Indian climate conditions, seasons, and regional growing differences
- DIY soil mixes using affordable local materials (cocopeat, vermicompost, kitchen waste)
- Common plant problems and 100% organic solutions (neem oil, compost tea, eggshells etc.)
- Fertilizer schedules using kitchen waste (banana peel, tea leaves, coffee grounds)
- Water conservation and efficient watering techniques

Live plant database you have access to:
${plantKnowledge}

Personality & style:
- Warm, encouraging, and practical — like a knowledgeable farming uncle/aunty
- Give specific, actionable advice with quantities and timelines
- Always recommend organic/natural solutions first — NEVER suggest harmful chemicals
- Keep responses concise (3-6 sentences), but complete
- If the user writes in Hindi or Hinglish, respond in the same style
- Reference specific plants from the database when relevant
- Mention common household items Indian families have (old dabbas, bottles, etc.)`;

    const reply = await callClaude(systemPrompt, message, history, 600);
    res.json({ success: true, reply });

  } catch (error) {
    console.error('AI chat error:', error.message);
    const userMsg = error.message.includes('ANTHROPIC_API_KEY')
      ? 'AI not configured. Please add ANTHROPIC_API_KEY to your backend .env file.'
      : 'AI service temporarily unavailable. Please try again.';
    res.status(500).json({ success: false, message: userMsg });
  }
});

// ── POST /api/ai/diagnose ──────────────────────────────────
// Plant problem diagnosis — returns structured PROBLEM/CAUSE/FIX/PREVENT
router.post('/diagnose', optionalAuth, async (req, res) => {
  try {
    const { plantName, symptoms } = req.body;
    if (!symptoms?.trim()) {
      return res.status(400).json({ success: false, message: 'Symptoms description is required' });
    }

    // Fetch plant-specific problems if plant is known
    let plantContext = '';
    if (plantName) {
      const plant = await Plant.findOne({ name: { $regex: plantName, $options: 'i' } })
        .select('name commonProblems soilMix waterFrequency compatibleContainers');
      if (plant) {
        plantContext = `\nDatabase entry for ${plant.name}:\n- Watering: ${plant.waterFrequency}\n- Known problems: ${plant.commonProblems?.map(p => `${p.problem} (cause: ${p.cause}, solution: ${p.solution})`).join('; ')}`;
      }
    }

    const systemPrompt = `You are an expert plant pathologist specialising in Indian container gardens and rooftop farming. You provide organic-only solutions — never recommend chemical pesticides or synthetic fertilisers.${plantContext}`;

    const userMessage = `Plant: ${plantName || 'Unknown plant'}
Reported symptoms: ${symptoms}

Diagnose this problem and respond in EXACTLY this format (use these exact headers):

PROBLEM: [name of the problem in one clear phrase]
CAUSE: [what caused it — be specific]
FIX: [2-3 numbered organic solutions with quantities, e.g. "1. Spray neem oil (5ml per litre water) every 5 days"]
PREVENT: [1-2 sentences on how to prevent this in future]`;

    const diagnosis = await callClaude(systemPrompt, userMessage, [], 400);
    res.json({ success: true, diagnosis, plantName: plantName || 'Plant' });

  } catch (error) {
    console.error('AI diagnose error:', error.message);
    const userMsg = error.message.includes('ANTHROPIC_API_KEY')
      ? 'AI not configured. Add ANTHROPIC_API_KEY to .env.'
      : 'Diagnosis service unavailable.';
    res.status(500).json({ success: false, message: userMsg });
  }
});

// ── POST /api/ai/recommend ─────────────────────────────────
// Personalised plant recommendations based on user conditions
router.post('/recommend', optionalAuth, async (req, res) => {
  try {
    const { city, sunHours, containerType, experience, season } = req.body;
    const plantKnowledge = await buildPlantContext();

    const systemPrompt = `You are an expert urban farming advisor for Indian rooftop gardens. You only recommend plants from the provided database. Be specific and personalised to the user's conditions.`;

    const userMessage = `Recommend the TOP 3 best plants for this gardener.

Their conditions:
- City/Region: ${city || 'North India'}
- Daily sunlight available: ${sunHours || 4} hours
- Container they have: ${containerType || 'various'}
- Gardening experience: ${experience || 'beginner'}
- Current season: ${season || 'summer'}

Available plants in our database:
${plantKnowledge}

Respond in EXACTLY this format:

1. [Plant Name] — [One sentence explaining why it's perfect for THEIR specific conditions]
2. [Plant Name] — [One sentence explaining why it's perfect for THEIR specific conditions]
3. [Plant Name] — [One sentence explaining why it's perfect for THEIR specific conditions]

BONUS TIP: [One very specific, practical tip for their city/season/container combination]`;

    const recommendations = await callClaude(systemPrompt, userMessage, [], 400);
    res.json({ success: true, recommendations });

  } catch (error) {
    console.error('AI recommend error:', error.message);
    const userMsg = error.message.includes('ANTHROPIC_API_KEY')
      ? 'AI not configured. Add ANTHROPIC_API_KEY to .env.'
      : 'Recommendation service unavailable.';
    res.status(500).json({ success: false, message: userMsg });
  }
});

// ── POST /api/ai/quick-tip ─────────────────────────────────
// Get a quick daily farming tip (used on dashboard)
router.get('/quick-tip', async (req, res) => {
  try {
    const { season, city } = req.query;
    const plantKnowledge = await buildPlantContext();

    const systemPrompt = `You are a friendly urban farming expert. Give concise, actionable tips for Indian rooftop gardeners.`;

    const userMessage = `Give me ONE practical rooftop farming tip for today.
Season: ${season || 'summer'}
City: ${city || 'Delhi'}
Available plants: ${plantKnowledge.split('\n').slice(0, 5).join('; ')}

Format:
TITLE: [5 words max]
TIP: [2-3 sentences, very specific and actionable]
EMOJI: [one relevant emoji]`;

    const tip = await callClaude(systemPrompt, userMessage, [], 200);
    res.json({ success: true, tip });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Tip service unavailable.' });
  }
});

module.exports = router;
