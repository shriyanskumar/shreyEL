const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  summary: String,
  keyPoints: [String],
  suggestedActions: [String],
  importance: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  readabilityScore: Number,
  generatedBy: {
    type: String,
    default: 'ai-module'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Summary', summarySchema);
