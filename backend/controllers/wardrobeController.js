const WardrobeItem = require('../models/WardrobeItem');

// @desc    Get user's wardrobe items
// @route   GET /api/wardrobe
// @access  Private
const getWardrobeItems = async (req, res) => {
  try {
    const items = await WardrobeItem.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to wardrobe
// @route   POST /api/wardrobe
// @access  Private
const createWardrobeItem = async (req, res) => {
  try {
    const { category, color, brand, notes, image } = req.body;

    const item = await WardrobeItem.create({
      user: req.user.id,
      category,
      color,
      brand,
      notes,
      image: req.file ? '/uploads/' + req.file.filename : (image || '')
    });
    
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add item', error: error.message });
  }
};

// @desc    Update wardrobe item
// @route   PUT /api/wardrobe/:id
// @access  Private
const updateWardrobeItem = async (req, res) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedItem = await WardrobeItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update item' });
  }
};

// @desc    Delete wardrobe item
// @route   DELETE /api/wardrobe/:id
// @access  Private
const deleteWardrobeItem = async (req, res) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await item.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getWardrobeItems,
  createWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem
};
