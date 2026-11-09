const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  percentage: { type: Number, required: true },
  color:      { type: String, default: '#8B4513' }
}, { _id: false });

const categoryCompostSchema = new mongoose.Schema({
  category:    { type: String, required: true, unique: true, index: true },
  label:       { type: String, required: true },
  emoji:       { type: String, default: '🌱' },
  color:       { type: String, default: '#16a34a' },
  bg:          { type: String, default: '#dcfce7' },
  border:      { type: String, default: '#86efac' },
  examples:    [{ type: String }],
  compostName: { type: String, required: true },
  recipe:      [componentSchema],
  why:         { type: String, default: '' },
  tips:        [{ type: String }],
  ph:          { type: String, default: '6.0 – 7.0' },
  drainage:    { type: String, default: 'Good' },
}, { timestamps: true });

module.exports = mongoose.model('CategoryCompost', categoryCompostSchema);
