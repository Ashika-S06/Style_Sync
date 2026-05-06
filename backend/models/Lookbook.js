const mongoose = require('mongoose');

const lookbookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String, // Store URL or path to image
    required: false
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WardrobeItem'
  }],
  tags: [{ 
    type: String 
  }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, min: 1, max: 5 }
  }],
  wouldWear: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answer: { type: Boolean }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Lookbook', lookbookSchema);
