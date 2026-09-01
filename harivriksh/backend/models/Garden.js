const mongoose = require('mongoose');

const gardenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, default: 'My Rooftop Garden' },
  location: { type: String },
  sunHours: { type: Number, default: 4 },
  area: { type: String },
  containers: [{
    containerType: String,
    size: String,
    plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
    plantedDate: Date,
    expectedHarvestDate: Date,
    status: { type: String, enum: ['empty', 'growing', 'harvested', 'problem'], default: 'empty' },
    notes: String,
    photo: String
  }],
  totalPlants: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

const containerSchema = new mongoose.Schema({
  type: { type: String, required: true },
  emoji: String,
  sizeRange: { min: String, max: String },
  volumeLiters: { min: Number, max: Number },
  description: String,
  pros: [String],
  cons: [String],
  bestFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  preparationTips: [String],
  drainageInfo: String
}, { timestamps: true });

module.exports = {
  Garden: mongoose.model('Garden', gardenSchema),
  Container: mongoose.model('Container', containerSchema)
};
