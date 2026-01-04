const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  // Human-friendly category label (kept for backward compatibility).
  // Enum removed so custom categories are allowed; authoritative link is `categoryId`.
  category: {
    type: String,
    default: 'other'
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  status: {
    type: String,
    enum: ['submitted', 'in-progress', 'approved', 'expiring', 'expired'],
    default: 'submitted'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  expiryDate: Date,
  renewalDate: Date,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  notes: String,
  reminderSent: {
    type: Boolean,
    default: false
  },
  metadata: {
    issueDate: Date,
    issuer: String,
    referenceNumber: String
  }
});

module.exports = mongoose.model('Document', documentSchema);
