const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#757575'
  },
  icon: {
    type: String,
    default: '📁'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
