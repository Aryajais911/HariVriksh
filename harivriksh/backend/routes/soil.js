const express = require('express');
const router = express.Router();

const SOIL_GUIDES = [
  {
    id: 'basic-veggie',
    name: 'Basic Vegetable Mix',
    color: '#8B4513',
    emoji: '🥬',
    bestFor: ['Tomato', 'Chilli', 'Brinjal', 'Bottle Gourd'],
    description: 'Perfect for fruiting vegetables. Excellent drainage keeps roots healthy and prevents rot.',
    components: [
      { name: 'Garden Soil', percentage: 50, color: '#8B4513' },
      { name: 'Compost', percentage: 30, color: '#5C4033' },
      { name: 'River Sand', percentage: 20, color: '#D4B483' }
    ],
    tips: [
      'Use kitchen waste compost — completely free!',
      'Add 1 tsp neem cake per kg to prevent pests',
      'Change topsoil every 6 months'
    ],
    ph: '6.0 - 7.0',
    drainage: 'Excellent'
  },
  {
    id: 'herb-mix',
    name: 'Herb & Leafy Mix',
    color: '#228B22',
    emoji: '🌿',
    bestFor: ['Mint', 'Basil', 'Coriander', 'Spinach', 'Fenugreek'],
    description: 'Lightweight mix retains moisture well. Perfect for shallow containers like bottles.',
    components: [
      { name: 'Cocopeat', percentage: 40, color: '#DEB887' },
      { name: 'Garden Soil', percentage: 40, color: '#8B4513' },
      { name: 'Vermicompost', percentage: 20, color: '#4A2C2A' }
    ],
    tips: [
      'Used tea leaves work as excellent fertilizer',
      'Cocopeat is available cheaply at nurseries',
      'Water when top 1 inch feels dry'
    ],
    ph: '6.0 - 7.5',
    drainage: 'Good'
  },
  {
    id: 'flower-mix',
    name: 'Flower & Ornamental Mix',
    color: '#FF6B35',
    emoji: '🌸',
    bestFor: ['Marigold', 'Roses', 'Petunia', 'Geranium'],
    description: 'Slightly acidic mix with excellent aeration. Used tea bags and banana peels add natural nutrients.',
    components: [
      { name: 'Garden Soil', percentage: 50, color: '#8B4513' },
      { name: 'Leaf Compost', percentage: 30, color: '#556B2F' },
      { name: 'Perlite / Coarse Sand', percentage: 20, color: '#B0C4DE' }
    ],
    tips: [
      'Add dried banana peel for potassium boost',
      'Crushed eggshells improve calcium content',
      'Used coffee grounds lower pH naturally'
    ],
    ph: '5.5 - 6.5',
    drainage: 'Very Good'
  },
  {
    id: 'fruit-mix',
    name: 'Fruit & Deep Root Mix',
    color: '#FF8C00',
    emoji: '🍋',
    bestFor: ['Lemon', 'Guava', 'Curry Leaf', 'Drumstick'],
    description: 'Deep nutrient-rich mix for trees in large containers. Adds slow-release fertilizers for long growth.',
    components: [
      { name: 'Garden Soil', percentage: 40, color: '#8B4513' },
      { name: 'Compost', percentage: 30, color: '#5C4033' },
      { name: 'Sand', percentage: 20, color: '#D4B483' },
      { name: 'Bone Meal', percentage: 10, color: '#F5F5DC' }
    ],
    tips: [
      'Add slow-release fertilizer pellets at planting',
      'Mulch the surface with dry leaves',
      'Water deeply but less frequently'
    ],
    ph: '6.0 - 7.0',
    drainage: 'Moderate'
  }
];

// GET /api/soil
router.get('/', (req, res) => {
  res.json({ success: true, guides: SOIL_GUIDES });
});

// GET /api/soil/:id
router.get('/:id', (req, res) => {
  const guide = SOIL_GUIDES.find(g => g.id === req.params.id);
  if (!guide) return res.status(404).json({ success: false, message: 'Guide not found' });
  res.json({ success: true, guide });
});

module.exports = router;
