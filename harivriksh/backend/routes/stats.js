const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Plant = require('../models/Plant');
const Post = require('../models/Post');
const Reminder = require('../models/Reminder');
const { Garden } = require('../models/Garden');
const { protect } = require('../middleware/auth');

// GET /api/stats/dashboard — user's personal dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [garden, reminders, posts, savedCount] = await Promise.all([
      Garden.findOne({ user: userId }).populate('containers.plant', 'name emoji harvestDays'),
      Reminder.countDocuments({ user: userId, isCompleted: false, isActive: true }),
      Post.countDocuments({ author: userId }),
      User.findById(userId).select('savedPlants').lean()
    ]);

    const containers = garden?.containers || [];
    const activePlants = containers.filter(c => c.plant && c.status === 'growing');
    const emptyContainers = containers.filter(c => c.status === 'empty');

    // Calculate upcoming harvests
    const upcomingHarvests = activePlants
      .filter(c => c.plantedDate && c.plant?.harvestDays?.max)
      .map(c => {
        const planted = new Date(c.plantedDate);
        const harvestDate = new Date(planted.getTime() + c.plant.harvestDays.max * 86400000);
        const daysLeft = Math.ceil((harvestDate - Date.now()) / 86400000);
        return { plant: c.plant.name, emoji: c.plant.emoji, daysLeft: Math.max(0, daysLeft), containerType: c.containerType };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);

    // Overdue reminders
    const overdueReminders = await Reminder.countDocuments({
      user: userId,
      isCompleted: false,
      isActive: true,
      dueDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      stats: {
        totalContainers: containers.length,
        activePlants: activePlants.length,
        emptyContainers: emptyContainers.length,
        pendingReminders: reminders,
        overdueReminders,
        communityPosts: posts,
        savedPlants: savedCount?.savedPlants?.length || 0,
        upcomingHarvests
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/stats/public — public platform stats (no auth)
router.get('/public', async (req, res) => {
  try {
    const [users, plants, posts, gardens] = await Promise.all([
      User.countDocuments(),
      Plant.countDocuments(),
      Post.countDocuments(),
      Garden.countDocuments()
    ]);

    const totalContainers = await Garden.aggregate([
      { $project: { count: { $size: '$containers' } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalFarmers: users,
        totalPlants: plants,
        totalPosts: posts,
        totalGardens: gardens,
        totalContainers: totalContainers[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
