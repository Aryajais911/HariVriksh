const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const { protect, optionalAuth } = require('../middleware/auth');

// GET /api/plants - Get all plants with filters
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, container, season, limit = 20, page = 1 } = req.query;
    let query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (season) query.seasons = { $in: [season, 'all'] };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    if (container) {
      query['compatibleContainers.type'] = { $regex: container, $options: 'i' };
    }
    const total = await Plant.countDocuments(query);
    const plants = await Plant.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ rating: -1 });
    res.json({ success: true, plants, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/plants/match - Smart container matcher
router.post('/match', async (req, res) => {
  try {
    const { containerType, volumeLiters, sunHours, season, experience } = req.body;
    let query = {};
    // Match by container type
    if (containerType) {
      query['compatibleContainers.type'] = { $regex: containerType, $options: 'i' };
    }
    // Match by sun requirement
    if (sunHours) {
      if (sunHours <= 3) query.sunRequirement = 'low';
      else if (sunHours <= 5) query.sunRequirement = { $in: ['low', 'medium'] };
      else query.sunRequirement = { $in: ['low', 'medium', 'high'] };
    }
    if (season) query.seasons = { $in: [season, 'all'] };
    // Filter by experience
    if (experience === 'beginner') query.difficulty = 'easy';
    else if (experience === 'intermediate') query.difficulty = { $in: ['easy', 'medium'] };

    const plants = await Plant.find(query).sort({ rating: -1 }).limit(6);
    // Score and sort
    const scored = plants.map(plant => {
      let score = plant.rating * 10;
      if (experience === 'beginner' && plant.difficulty === 'easy') score += 20;
      return { ...plant.toObject(), matchScore: Math.min(Math.round(score), 99) };
    });
    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ success: true, plants: scored });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/plants/:id
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ success: false, message: 'Plant not found' });
    res.json({ success: true, plant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/plants/:id/save
router.post('/:id/save', protect, async (req, res) => {
  try {
    const user = req.user;
    const plantId = req.params.id;
    const idx = user.savedPlants.indexOf(plantId);
    if (idx > -1) {
      user.savedPlants.splice(idx, 1);
    } else {
      user.savedPlants.push(plantId);
    }
    await user.save();
    res.json({ success: true, saved: idx === -1, savedPlants: user.savedPlants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
