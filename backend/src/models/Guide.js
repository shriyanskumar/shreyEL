const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['license', 'certificate', 'permit', 'insurance', 'contract', 'other'],
    default: 'other'
  },
  steps: [{
    stepNumber: Number,
    title: String,
    description: String,
    tips: [String],
    documents: [String]
  }],
  estimatedTime: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  relatedDocuments: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Guide', guideSchema);
