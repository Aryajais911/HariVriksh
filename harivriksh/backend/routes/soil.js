const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SoilGuide = require('../models/SoilGuide');

let Plant, CategoryCompost;
try { Plant = require('../models/Plant'); } catch(e) { Plant = null; }
try { CategoryCompost = require('../models/CategoryCompost'); } catch(e) { CategoryCompost = null; }

// Helper: only query DB when actually connected (avoids 10-second buffering timeout)
const isDbConnected = () => mongoose.connection.readyState === 1;


const FALLBACK_GUIDES = [
  {
    id: 'basic-veggie',
    name: 'Basic Vegetable Mix',
    color: '#8B4513',
    emoji: '🥬',
    bestFor: ['Tomato', 'Chilli', 'Brinjal', 'Bottle Gourd', 'Capsicum'],
    description: 'Perfect for fruiting and vegetable plants. Excellent drainage keeps roots healthy and prevents rot.',
    components: [
      { name: 'Garden Soil', percentage: 50, color: '#8B4513' },
      { name: 'Compost / Vermicompost', percentage: 30, color: '#5C4033' },
      { name: 'River Sand / Cocopeat', percentage: 20, color: '#D4B483' }
    ],
    tips: [
      'Use kitchen waste compost — completely rich and nutrient-dense!',
      'Add 1 tsp neem cake powder per kg of mix to prevent pest attacks.',
      'Replenish top layer with 2 inches of compost every 6 months.'
    ],
    ph: '6.0 - 7.0',
    drainage: 'Excellent'
  },
  {
    id: 'herb-mix',
    name: 'Herb & Leafy Mix',
    color: '#228B22',
    emoji: '🌿',
    bestFor: ['Mint', 'Basil', 'Coriander', 'Spinach', 'Fenugreek', 'Curry Leaf'],
    description: 'Lightweight mix retains moisture well without waterlogging. Ideal for shallow containers like bottles and trays.',
    components: [
      { name: 'Cocopeat', percentage: 40, color: '#DEB887' },
      { name: 'Garden Soil', percentage: 40, color: '#8B4513' },
      { name: 'Vermicompost', percentage: 20, color: '#4A2C2A' }
    ],
    tips: [
      'Decomposed tea leaves serve as an excellent nitrogen booster for green leafy growth.',
      'Expand cocopeat blocks thoroughly in water before mixing.',
      'Water when top 1 inch feels slightly dry to the touch.'
    ],
    ph: '6.0 - 7.5',
    drainage: 'Good'
  },
  {
    id: 'flower-mix',
    name: 'Flower & Ornamental Mix',
    color: '#FF6B35',
    emoji: '🌸',
    bestFor: ['Marigold', 'Roses', 'Petunia', 'Geranium', 'Hibiscus'],
    description: 'Rich, aerated blend with balanced organic nutrients to encourage continuous flowering and vibrant blooms.',
    components: [
      { name: 'Garden Soil', percentage: 50, color: '#8B4513' },
      { name: 'Leaf Compost', percentage: 30, color: '#556B2F' },
      { name: 'Perlite / Coarse Sand', percentage: 20, color: '#B0C4DE' }
    ],
    tips: [
      'Mix in dried, crushed banana peels for a natural potassium boost.',
      'Crushed eggshells add calcium, preventing flower blossom drop.',
      'Ensure pots have unobstructed drainage holes.'
    ],
    ph: '5.5 - 6.5',
    drainage: 'Very Good'
  },
  {
    id: 'fruit-mix',
    name: 'Fruit & Deep Root Mix',
    color: '#FF8C00',
    emoji: '🍋',
    bestFor: ['Lemon', 'Guava', 'Pomegranate', 'Papaya', 'Drumstick'],
    description: 'Heavy, nutrient-rich soil mix designed for large containers, fruit trees, and perennial woody crops.',
    components: [
      { name: 'Garden Soil', percentage: 40, color: '#8B4513' },
      { name: 'Compost', percentage: 30, color: '#5C4033' },
      { name: 'Sand', percentage: 20, color: '#D4B483' },
      { name: 'Bone Meal / Neem Cake', percentage: 10, color: '#F5F5DC' }
    ],
    tips: [
      'Mix slow-release organic fertilizer at planting time.',
      'Mulch surface with 2 inches of dry leaves or wood chips to retain moisture.',
      'Water deeply but allow soil to dry between watering cycles.'
    ],
    ph: '6.0 - 7.0',
    drainage: 'Moderate'
  },
  {
    id: 'succulent-mix',
    name: 'Cactus & Succulent Mix',
    color: '#2E8B57',
    emoji: '🌵',
    bestFor: ['Aloe Vera', 'Jade Plant', 'Snake Plant', 'Haworthia', 'Echeveria'],
    description: 'Ultra-fast draining porous soil recipe that prevents root rot for desert and succulent plants.',
    components: [
      { name: 'Coarse Sand / Gravel', percentage: 50, color: '#D4B483' },
      { name: 'Garden Soil', percentage: 30, color: '#8B4513' },
      { name: 'Pumice / Perlite', percentage: 20, color: '#E0EEEE' }
    ],
    tips: [
      'Never allow standing water in saucer plates beneath succulent pots.',
      'Water only when soil is completely bone dry all the way down.',
      'Avoid high-nitrogen organic compost to prevent weak leggy stems.'
    ],
    ph: '6.0 - 7.0',
    drainage: 'Ultra Fast'
  },
  {
    id: 'seedling-mix',
    name: 'Seed Germination Mix',
    color: '#4682B4',
    emoji: '🌱',
    bestFor: ['Seed Starters', 'Microgreens', 'Cuttings', 'Young Plantlets'],
    description: 'Sterile, lightweight, fine-texture mix ensuring maximum germination rates and tender root formation.',
    components: [
      { name: 'Fine Cocopeat', percentage: 70, color: '#DEB887' },
      { name: 'Vermiculite / Perlite', percentage: 20, color: '#E5E5E5' },
      { name: 'Fine Vermicompost', percentage: 10, color: '#4A2C2A' }
    ],
    tips: [
      'Moisten mix lightly with a gentle water mist bottle before sowing seeds.',
      'Do not add heavy fertilizers to seed mix — tender young roots can burn.',
      'Keep tray covered with transparent film until sprouts emerge.'
    ],
    ph: '5.8 - 6.8',
    drainage: 'High Aeration'
  }
];

// Category-to-guide mapping for smart recommendations
const CATEGORY_GUIDE_MAP = {
  'vegetable': 'basic-veggie',
  'herb': 'herb-mix',
  'leafy': 'herb-mix',
  'flower': 'flower-mix',
  'fruit': 'fruit-mix'
};

// Component color palette for plant-specific mixes
const COMPONENT_COLORS = {
  'cocopeat': '#DEB887',
  'garden soil': '#8B4513',
  'vermicompost': '#4A2C2A',
  'compost': '#5C4033',
  'sand': '#D4B483',
  'river sand': '#D4B483',
  'perlite': '#B0C4DE',
  'bone meal': '#F5F5DC',
  'neem cake': '#8FBC8F',
  'leaf compost': '#556B2F'
};

function getComponentColor(name) {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(COMPONENT_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#8B4513';
}

// GET /api/soil - Fetch all dynamic soil guides from MongoDB (with instant offline fallback)
router.get('/', async (req, res) => {
  if (!isDbConnected()) {
    return res.json({ success: true, guides: FALLBACK_GUIDES, source: 'fallback' });
  }
  try {
    let guides = await SoilGuide.find().sort({ createdAt: 1 });
    if (!guides || guides.length === 0) {
      await SoilGuide.insertMany(FALLBACK_GUIDES);
      guides = await SoilGuide.find().sort({ createdAt: 1 });
    }
    res.json({ success: true, guides, source: 'db' });
  } catch (error) {
    res.json({ success: true, guides: FALLBACK_GUIDES, source: 'fallback' });
  }
});

// GET /api/soil/category-guides — Dynamic compost guide for each plant type
// Served from MongoDB when online; instant fallback when offline (no 10s timeout)
const FALLBACK_CATEGORY_COMPOSTS = [
  {
    category: 'vegetable', label: 'Vegetables', emoji: '🥬',
    color: '#16a34a', bg: '#dcfce7', border: '#86efac',
    examples: ['Tomato', 'Chilli', 'Brinjal', 'Capsicum', 'Bottle Gourd', 'Okra'],
    compostName: 'Basic Vegetable Compost',
    recipe: [
      { name: 'Garden Soil',            percentage: 50, color: '#8B4513' },
      { name: 'Compost / Vermicompost', percentage: 30, color: '#5C4033' },
      { name: 'River Sand / Cocopeat',  percentage: 20, color: '#D4B483' },
    ],
    why: 'Fruiting vegetables need well-drained, rich soil with plenty of phosphorus and potassium for strong fruit development.',
    tips: ['Add 1 tsp neem cake per kg to repel pests', 'Kitchen waste compost works perfectly', 'Replenish top layer every 6 months'],
    ph: '6.0 – 7.0', drainage: 'Excellent',
  },
  {
    category: 'herb', label: 'Herbs', emoji: '🌿',
    color: '#15803d', bg: '#f0fdf4', border: '#86efac',
    examples: ['Mint', 'Basil', 'Coriander', 'Fenugreek', 'Curry Leaf', 'Lemongrass'],
    compostName: 'Herb & Leafy Compost',
    recipe: [
      { name: 'Cocopeat',     percentage: 40, color: '#DEB887' },
      { name: 'Garden Soil',  percentage: 40, color: '#8B4513' },
      { name: 'Vermicompost', percentage: 20, color: '#4A2C2A' },
    ],
    why: 'Herbs need light, moisture-retaining soil. Cocopeat prevents waterlogging while vermicompost provides steady nitrogen for leaf growth.',
    tips: ['Used tea leaves = free nitrogen boost', 'Expand cocopeat in water before mixing', 'Water when top 1 inch feels dry'],
    ph: '6.0 – 7.5', drainage: 'Good',
  },
  {
    category: 'leafy', label: 'Leafy Greens', emoji: '🥗',
    color: '#065f46', bg: '#d1fae5', border: '#6ee7b7',
    examples: ['Spinach', 'Amaranth', 'Mustard Leaves', 'Lettuce', 'Methi'],
    compostName: 'Leafy Green Compost',
    recipe: [
      { name: 'Cocopeat',     percentage: 50, color: '#DEB887' },
      { name: 'Vermicompost', percentage: 30, color: '#4A2C2A' },
      { name: 'Garden Soil',  percentage: 20, color: '#8B4513' },
    ],
    why: 'Leafy greens are heavy nitrogen feeders. High vermicompost ratio fuels rapid, lush leaf growth in shallow containers.',
    tips: ['Spray diluted cow dung water weekly', 'Grow in partial shade in summer', 'Harvest outer leaves first'],
    ph: '6.0 – 7.0', drainage: 'High',
  },
  {
    category: 'fruit', label: 'Fruits & Trees', emoji: '🍋',
    color: '#9a3412', bg: '#ffedd5', border: '#fdba74',
    examples: ['Lemon', 'Guava', 'Pomegranate', 'Papaya', 'Drumstick'],
    compostName: 'Fruit & Deep Root Compost',
    recipe: [
      { name: 'Garden Soil',           percentage: 40, color: '#8B4513' },
      { name: 'Compost',               percentage: 30, color: '#5C4033' },
      { name: 'Sand',                  percentage: 20, color: '#D4B483' },
      { name: 'Bone Meal / Neem Cake', percentage: 10, color: '#F5F5DC' },
    ],
    why: 'Fruit trees need heavy, nutrient-dense soil with good aeration. Bone meal provides slow-release phosphorus for root expansion.',
    tips: ['Use 25L+ containers for fruiting trees', 'Mulch surface with dry leaves', 'Water deeply but infrequently'],
    ph: '6.0 – 7.0', drainage: 'Moderate',
  },
  {
    category: 'flower', label: 'Flowers & Ornamentals', emoji: '🌸',
    color: '#9d174d', bg: '#fce7f3', border: '#f9a8d4',
    examples: ['Marigold', 'Rose', 'Petunia', 'Geranium', 'Hibiscus', 'Mogra'],
    compostName: 'Flower & Bloom Compost',
    recipe: [
      { name: 'Garden Soil',           percentage: 50, color: '#8B4513' },
      { name: 'Leaf Compost',          percentage: 30, color: '#556B2F' },
      { name: 'Perlite / Coarse Sand', percentage: 20, color: '#B0C4DE' },
    ],
    why: 'Flowering plants need slightly acidic, aerated soil. Leaf compost provides potassium that triggers bloom production.',
    tips: ['Crushed banana peels = free potassium', 'Eggshell powder prevents blossom drop', 'Deadhead spent flowers weekly'],
    ph: '5.5 – 6.5', drainage: 'Very Good',
  },
  {
    category: 'succulent', label: 'Succulents & Cacti', emoji: '🌵',
    color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7',
    examples: ['Aloe Vera', 'Jade Plant', 'Snake Plant', 'Haworthia', 'Echeveria'],
    compostName: 'Cactus & Succulent Mix',
    recipe: [
      { name: 'Coarse Sand / Gravel', percentage: 50, color: '#D4B483' },
      { name: 'Garden Soil',          percentage: 30, color: '#8B4513' },
      { name: 'Pumice / Perlite',     percentage: 20, color: '#E0EEEE' },
    ],
    why: 'Succulents store water in leaves and rot in wet soil. Ultra-fast draining gritty mix prevents root rot completely.',
    tips: ['Never use normal potting mix for succulents', 'Water only when completely bone-dry', 'Avoid organic-heavy fertilizer'],
    ph: '6.0 – 7.0', drainage: 'Ultra Fast',
  },
  {
    category: 'seedling', label: 'Seeds & Seedlings', emoji: '🌱',
    color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd',
    examples: ['Any seed germination', 'Microgreens', 'Cuttings', 'Young Transplants'],
    compostName: 'Seed Germination Mix',
    recipe: [
      { name: 'Fine Cocopeat',         percentage: 70, color: '#DEB887' },
      { name: 'Vermiculite / Perlite', percentage: 20, color: '#E5E5E5' },
      { name: 'Fine Vermicompost',     percentage: 10, color: '#4A2C2A' },
    ],
    why: 'Seeds need a sterile, airy, moisture-holding medium. Heavy soil smothers tender seedling roots.',
    tips: ['Mist with spray bottle — never pour water', 'Cover tray with plastic wrap until sprouts appear', 'Transplant when 2nd set of leaves emerge'],
    ph: '5.8 – 6.8', drainage: 'High Aeration',
  },
];

router.get('/category-guides', async (req, res) => {
  // Instant fallback when DB offline — no buffering wait
  if (!isDbConnected() || !CategoryCompost) {
    return res.json({ success: true, categoryGuides: FALLBACK_CATEGORY_COMPOSTS, source: 'fallback' });
  }
  try {
    let guides = await CategoryCompost.find().sort({ createdAt: 1 });
    // Auto-seed if collection is empty (first run after DB connects)
    if (!guides || guides.length === 0) {
      await CategoryCompost.insertMany(FALLBACK_CATEGORY_COMPOSTS);
      guides = await CategoryCompost.find().sort({ createdAt: 1 });
      console.log('✅ Auto-seeded category compost guides into MongoDB');
    }
    res.json({ success: true, categoryGuides: guides, source: 'db' });
  } catch (error) {
    res.json({ success: true, categoryGuides: FALLBACK_CATEGORY_COMPOSTS, source: 'fallback' });
  }
});

// GET /api/soil/plants/list - Get all plant names for the recommender dropdown
router.get('/plants/list', async (req, res) => {
  if (!isDbConnected() || !Plant) {
    return res.json({ success: true, plants: [] });
  }
  try {
    const plants = await Plant.find().select('name emoji category soilMix').sort({ name: 1 });
    res.json({ success: true, plants });
  } catch (error) {
    res.json({ success: true, plants: [] });
  }
});


// GET /api/soil/recommend/:plantId - Recommend soil mix for a specific plant with ICAR/Kaggle scientific parameters
router.get('/recommend/:plantId', async (req, res) => {
  if (!isDbConnected() || !Plant) {
    return res.status(503).json({ success: false, message: 'Database not connected' });
  }
  try {
    const plant = await Plant.findById(req.params.plantId);
    if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });

    // Build the plant-specific soil recipe with colors and ICAR/Kaggle scientific metrics
    const plantMix = {
      recipe: plant.soilMix?.recipe || '',
      npkRatio: plant.soilMix?.npkRatio || { n: 8, p: 8, k: 8 },
      phRange: plant.soilMix?.phRange || { min: 6.0, max: 7.0 },
      soilTexture: plant.soilMix?.soilTexture || 'Balanced Sandy Loam',
      organicMatterPct: plant.soilMix?.organicMatterPct || 30,
      components: (plant.soilMix?.components || []).map(c => ({
        name: c.name,
        percentage: c.percentage,
        color: getComponentColor(c.name)
      }))
    };

    // Match to the closest general guide category
    const guideId = CATEGORY_GUIDE_MAP[plant.category] || 'basic-veggie';
    let matchedGuide = isDbConnected() ? await SoilGuide.findOne({ id: guideId }).catch(() => null) : null;
    if (!matchedGuide) {
      matchedGuide = FALLBACK_GUIDES.find(g => g.id === guideId) || FALLBACK_GUIDES[0];
    }

    res.json({
      success: true,
      plant: {
        _id: plant._id,
        name: plant.name,
        emoji: plant.emoji,
        category: plant.category,
        difficulty: plant.difficulty,
        waterFrequency: plant.waterFrequency
      },
      plantMix,
      recommendedGuide: {
        id: matchedGuide.id,
        name: matchedGuide.name,
        emoji: matchedGuide.emoji,
        ph: matchedGuide.ph,
        drainage: matchedGuide.drainage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/soil/smart-recommend - ICAR Smart NPK & Soil Adjustment Calculator
router.post('/smart-recommend', async (req, res) => {
  try {
    const { plantId, soilType = 'normal_garden', containerVolumeLiters = 10 } = req.body;
    let targetPlant = null;
    if (plantId && isDbConnected() && Plant) {
      targetPlant = await Plant.findById(plantId).catch(() => null);
    }

    const npk = targetPlant?.soilMix?.npkRatio || { n: 8, p: 8, k: 8 };
    const ph = targetPlant?.soilMix?.phRange || { min: 6.0, max: 7.0 };
    const baseTexture = targetPlant?.soilMix?.soilTexture || 'Balanced Sandy Loam';

    let components = [];
    let adjustmentNote = '';

    const volume = parseFloat(containerVolumeLiters) || 10;

    if (soilType === 'heavy_clay') {
      components = [
        { name: 'Garden Soil (Clay)', percentage: 35, color: '#8B4513' },
        { name: 'Coarse Sand / Perlite', percentage: 35, color: '#D4B483' },
        { name: 'Vermicompost', percentage: 30, color: '#5C4033' },
      ];
      adjustmentNote = 'ICAR Adjustment: Increased sand/aeration by +15% to break up heavy clay and prevent root suffocation.';
    } else if (soilType === 'sandy') {
      components = [
        { name: 'Sandy Soil', percentage: 30, color: '#D4B483' },
        { name: 'Vermicompost / Organic Compost', percentage: 45, color: '#5C4033' },
        { name: 'Cocopeat (Moisture Retention)', percentage: 25, color: '#DEB887' },
      ];
      adjustmentNote = 'ICAR Adjustment: Boosted organic compost by +20% & added Cocopeat to improve water & nutrient holding capacity.';
    } else if (soilType === 'spent_potting') {
      components = [
        { name: 'Used Potting Soil', percentage: 50, color: '#6B4226' },
        { name: 'Fresh Vermicompost', percentage: 35, color: '#5C4033' },
        { name: 'Neem Cake + Bone Meal / Wood Ash', percentage: 15, color: '#F5F5DC' },
      ];
      adjustmentNote = 'ICAR Adjustment: Added bio-fertilizer boosters (Neem Cake & Bone Meal) to recharge spent soil NPK & repels soil pathogens.';
    } else {
      // Normal garden soil
      components = targetPlant?.soilMix?.components?.length
        ? targetPlant.soilMix.components.map(c => ({ name: c.name, percentage: c.percentage, color: getComponentColor(c.name) }))
        : [
            { name: 'Garden Soil', percentage: 50, color: '#8B4513' },
            { name: 'Vermicompost', percentage: 30, color: '#5C4033' },
            { name: 'Cocopeat / Sand', percentage: 20, color: '#D4B483' },
          ];
      adjustmentNote = 'ICAR Standard: Balanced baseline potting mix formula for optimal root development.';
    }

    const calculatedVolume = components.map(c => ({
      ...c,
      liters: parseFloat(((volume * c.percentage) / 100).toFixed(2))
    }));

    res.json({
      success: true,
      plantName: targetPlant ? targetPlant.name : 'Custom Crop',
      soilType,
      volumeLiters: volume,
      npkRatio: npk,
      phRange: ph,
      soilTexture: baseTexture,
      adjustmentNote,
      components: calculatedVolume
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/soil/:id - Get single soil guide
router.get('/:id', async (req, res) => {
  // Serve fallback immediately if DB offline
  if (!isDbConnected()) {
    const guide = FALLBACK_GUIDES.find(g => g.id === req.params.id);
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    return res.json({ success: true, guide, source: 'fallback' });
  }
  try {
    let guide = await SoilGuide.findOne({ id: req.params.id });
    if (!guide) guide = FALLBACK_GUIDES.find(g => g.id === req.params.id);
    if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
    res.json({ success: true, guide, source: 'db' });
  } catch (error) {
    const guide = FALLBACK_GUIDES.find(g => g.id === req.params.id);
    if (guide) return res.json({ success: true, guide, source: 'fallback' });
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/soil - Add a new custom soil guide (dynamic insertion)
router.post('/', async (req, res) => {
  try {
    const { id, name, color, emoji, bestFor, description, components, tips, ph, drainage } = req.body;
    if (!name || !components || components.length === 0) {
      return res.status(400).json({ success: false, message: 'Name and components are required' });
    }
    const slug = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newGuide = new SoilGuide({
      id: slug,
      name,
      color: color || '#8B4513',
      emoji: emoji || '🪴',
      bestFor: bestFor || [],
      description: description || '',
      components,
      tips: tips || [],
      ph: ph || '6.0 - 7.0',
      drainage: drainage || 'Good'
    });
    await newGuide.save();
    res.status(201).json({ success: true, guide: newGuide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


