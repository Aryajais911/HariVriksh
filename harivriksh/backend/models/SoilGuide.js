const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
  color: { type: String, default: '#8B4513' }
}, { _id: false });

const soilGuideSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  color: { type: String, default: '#8B4513' },
  emoji: { type: String, default: '🌱' },
  bestFor: [{ type: String }],
  description: { type: String, required: true },
  components: [componentSchema],
  tips: [{ type: String }],
  ph: { type: String, default: '6.0 - 7.0' },
  drainage: { type: String, default: 'Good' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoilGuide', soilGuideSchema);
