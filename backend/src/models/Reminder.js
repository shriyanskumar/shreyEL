const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reminderType: {
    type: String,
    enum: ['expiry', 'renewal', 'review', 'custom'],
    default: 'expiry'
  },
  reminderDate: {
    type: Date,
    required: true
  },
  daysBeforeExpiry: {
    type: Number,
    default: 30
  },
  notificationMethod: {
    type: String,
    enum: ['email', 'in-app', 'both'],
    default: 'both'
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: Date,
  read: {
    type: Boolean,
    default: false
  },
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reminder', reminderSchema);
