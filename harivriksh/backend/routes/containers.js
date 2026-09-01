const express = require('express');
const router = express.Router();
const { Container } = require('../models/Garden');

// GET /api/containers
router.get('/', async (req, res) => {
  try {
    const containers = await Container.find().populate('bestFor', 'name emoji category');
    res.json({ success: true, containers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/containers/:id
router.get('/:id', async (req, res) => {
  try {
    const container = await Container.findById(req.params.id).populate('bestFor');
    if (!container) return res.status(404).json({ success: false, message: 'Container not found' });
    res.json({ success: true, container });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
