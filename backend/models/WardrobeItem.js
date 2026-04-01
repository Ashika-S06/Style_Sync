const mongoose = require('mongoose');

const wardrobeItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear', 'other']
  },
  color: {
    type: String
  },
  brand: {
    type: String
  },
  notes: {
    type: String
  }
}, { timestamps: true, collection: 'fashion' });

module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);
