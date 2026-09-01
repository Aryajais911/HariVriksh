const express = require('express');
const router = express.Router();
const { Garden } = require('../models/Garden');
const { protect } = require('../middleware/auth');

// GET /api/gardens/my
router.get('/my', protect, async (req, res) => {
  try {
    let garden = await Garden.findOne({ user: req.user._id })
      .populate('containers.plant', 'name emoji category difficulty harvestDays');
    if (!garden) {
      garden = await Garden.create({ user: req.user._id, name: `${req.user.name}'s Garden` });
    }
    res.json({ success: true, garden });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/gardens/my
router.put('/my', protect, async (req, res) => {
  try {
    const { name, location, sunHours, area, isPublic } = req.body;
    const garden = await Garden.findOneAndUpdate(
      { user: req.user._id },
      { name, location, sunHours, area, isPublic },
      { new: true, upsert: true }
    ).populate('containers.plant', 'name emoji category');
    res.json({ success: true, garden });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/gardens/my/containers
router.post('/my/containers', protect, async (req, res) => {
  try {
    const { containerType, size, plantId, notes } = req.body;
    const garden = await Garden.findOne({ user: req.user._id });
    if (!garden) return res.status(404).json({ success: false, message: 'Garden not found' });

    const plantedDate = new Date();
    const container = {
      containerType, size,
      plant: plantId || null,
      plantedDate: plantId ? plantedDate : null,
      status: plantId ? 'growing' : 'empty',
      notes
    };
    garden.containers.push(container);
    garden.totalPlants = garden.containers.filter(c => c.plant).length;
    await garden.save();
    await garden.populate('containers.plant', 'name emoji category harvestDays');
    res.json({ success: true, garden });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/gardens/my/containers/:containerId
router.delete('/my/containers/:containerId', protect, async (req, res) => {
  try {
    const garden = await Garden.findOne({ user: req.user._id });
    garden.containers = garden.containers.filter(c => c._id.toString() !== req.params.containerId);
    garden.totalPlants = garden.containers.filter(c => c.plant).length;
    await garden.save();
    res.json({ success: true, garden });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/gardens/public
router.get('/public', async (req, res) => {
  try {
    const gardens = await Garden.find({ isPublic: true })
      .populate('user', 'name city avatar')
      .populate('containers.plant', 'name emoji')
      .limit(12);
    res.json({ success: true, gardens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
