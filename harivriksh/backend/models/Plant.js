const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scientificName: { type: String },
  category: { type: String, enum: ['vegetable', 'herb', 'fruit', 'flower', 'leafy'], required: true },
  emoji: { type: String, default: '🌱' },
  image: { type: String, default: '' },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  harvestDays: { min: Number, max: Number },
  sunRequirement: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  waterFrequency: { type: String },
  idealTemperature: { min: Number, max: Number },
  compatibleContainers: [{
    type: { type: String },
    minSize: String,
    notes: String
  }],
  soilMix: {
    recipe: String,
    components: [{
      name: String,
      percentage: Number
    }]
  },
  fertilizerSchedule: [{
    weekFrom: Number,
    weekTo: Number,
    fertilizer: String,
    amount: String,
    notes: String
  }],
  growingSteps: [{
    step: Number,
    title: String,
    description: String,
    duration: String
  }],
  commonProblems: [{
    problem: String,
    cause: String,
    solution: String
  }],
  benefits: [String],
  seasons: [{ type: String, enum: ['spring', 'summer', 'monsoon', 'autumn', 'winter', 'all'] }],
  tags: [String],
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Plant', plantSchema);
