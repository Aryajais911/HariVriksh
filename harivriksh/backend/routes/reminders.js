const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

// GET /api/reminders
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { user: req.user._id, isActive: true };
    if (status === 'pending') query.isCompleted = false;
    if (status === 'completed') query.isCompleted = true;
    const reminders = await Reminder.find(query)
      .populate('plant', 'name emoji')
      .sort({ dueDate: 1 });
    res.json({ success: true, reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reminders
router.post('/', protect, async (req, res) => {
  try {
    const { type, title, notes, dueDate, frequency, plantId, gardenId } = req.body;
    const reminder = await Reminder.create({
      user: req.user._id, type, title, notes,
      dueDate: new Date(dueDate), frequency,
      plant: plantId, garden: gardenId
    });
    await reminder.populate('plant', 'name emoji');
    res.status(201).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/reminders/:id/complete
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isCompleted: true, completedAt: new Date() },
      { new: true }
    ).populate('plant', 'name emoji');
    if (!reminder) return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
