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

// Organic Pathology Knowledge Base for fast fallback diagnosis
const ORGANIC_PATHOLOGY_DB = [
  {
    keywords: ['yellow', 'pila', 'yellowing'],
    problem: 'Nitrogen Deficiency or Overwatering',
    cause: 'Excess watering clogging root aeration OR lack of organic nitrogen in soil mix.',
    fix: '1. Reduce watering frequency and ensure drainage holes are clear.\n2. Add 2 tbsp of vermicompost or fermented mustard cake liquid fertilizer per pot.\n3. Spray diluted Epsom salt (1 tsp per litre water) on leaves.',
    prevent: 'Maintain proper 1:1:1 soil mix (cocopeat:compost:soil) and water only when top 1 inch soil is dry.'
  },
  {
    keywords: ['white', 'powder', 'mildew', 'safed'],
    problem: 'Powdery Mildew (Fungal Infection)',
    cause: 'High humidity, overcrowding, and lack of air circulation around leaves.',
    fix: '1. Mix 1 tbsp baking soda + 1/2 tsp dish soap + 1 litre water and spray thoroughly on leaves.\n2. Prune heavily infected lower leaves.\n3. Spray organic Neem Oil (5ml/L water) every 5 days.',
    prevent: 'Ensure good spacing between rooftop pots and avoid overhead watering in the evening.'
  },
  {
    keywords: ['spot', 'brown', 'black', 'dhabbe'],
    problem: 'Leaf Spot / Alternaria Blight',
    cause: 'Fungal spores germinating on wet leaf surfaces during warm humid weather.',
    fix: '1. Remove affected leaves immediately.\n2. Spray sour buttermilk solution (100ml sour buttermilk in 1L water).\n3. Keep foliage completely dry while watering at root zone.',
    prevent: 'Mulch around base of plant to stop rain splash from carrying soil fungi to lower leaves.'
  },
  {
    keywords: ['curl', 'wrinkle', 'pukering', 'muda'],
    problem: 'Chilli Leaf Curl Virus / Aphid Infestation',
    cause: 'Sucking pests like Thrips, Mites, or Whiteflies transmitting viral infections.',
    fix: '1. Spray strong stream of water to dislodge small insects under leaves.\n2. Spray Neem oil (5ml) + liquid soap (2ml) in 1L warm water twice a week.\n3. Hang yellow sticky traps around rooftop plants.',
    prevent: 'Regular weekly preventive neem spray and companion planting with Marigolds.'
  },
  {
    keywords: ['wilt', 'droop', 'dry', 'murdha'],
    problem: 'Root Rot or Bacterial Wilt',
    cause: 'Fungal root decay due to waterlogging or high soil temperature.',
    fix: '1. Stop watering immediately and check if pot drainage hole is blocked.\n2. Drench soil with Trichoderma viride bio-fungicide (5g per litre water).\n3. Move container into afternoon shade till recovery.',
    prevent: 'Use light, porous potting mix with 20% coarse sand or rice husk for drainage.'
  }
];

// ── POST /api/ai/diagnose ──────────────────────────────────
// Plant problem diagnosis — returns structured PROBLEM/CAUSE/FIX/PREVENT
router.post('/diagnose', optionalAuth, async (req, res) => {
  try {
    const { plantName, symptoms, imageUrl } = req.body;
    if (!symptoms?.trim() && !imageUrl) {
      return res.status(400).json({ success: false, message: 'Symptoms description or image is required' });
    }

    const querySymptoms = (symptoms || 'leaf discoloration spot problem').toLowerCase();

    // Try Claude AI first if API key exists
    if (process.env.ANTHROPIC_API_KEY) {
      try {
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
Reported symptoms: ${querySymptoms}
Attached Photo URL: ${imageUrl || 'None'}

Diagnose this problem and respond in EXACTLY this format (use these exact headers):

PROBLEM: [name of the problem in one clear phrase]
CAUSE: [what caused it — be specific]
FIX: [2-3 numbered organic solutions with quantities, e.g. "1. Spray neem oil (5ml per litre water) every 5 days"]
PREVENT: [1-2 sentences on how to prevent this in future]`;

        const diagnosis = await callClaude(systemPrompt, userMessage, [], 400);
        return res.json({ success: true, diagnosis, plantName: plantName || 'Plant' });
      } catch (aiErr) {
        console.warn('AI call failed, using intelligent organic fallback:', aiErr.message);
      }
    }

    // Intelligent Fallback pathology matcher
    const match = ORGANIC_PATHOLOGY_DB.find(p => p.keywords.some(k => querySymptoms.includes(k))) || ORGANIC_PATHOLOGY_DB[0];

    const diagnosis = `PROBLEM: ${match.problem}
CAUSE: ${match.cause}
FIX: ${match.fix}
PREVENT: ${match.prevent}`;

    res.json({ success: true, diagnosis, plantName: plantName || 'Plant' });

  } catch (error) {
    console.error('AI diagnose error:', error.message);
    res.status(500).json({ success: false, message: 'Diagnosis service unavailable.' });
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
