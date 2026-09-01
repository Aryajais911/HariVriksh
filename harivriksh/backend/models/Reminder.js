const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  garden: { type: mongoose.Schema.Types.ObjectId, ref: 'Garden' },
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
  type: { type: String, enum: ['water', 'fertilize', 'harvest', 'prune', 'repot', 'custom'], required: true },
  title: { type: String, required: true },
  notes: String,
  dueDate: { type: Date, required: true },
  frequency: { type: String, enum: ['once', 'daily', 'weekly', 'biweekly', 'monthly'], default: 'once' },
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
