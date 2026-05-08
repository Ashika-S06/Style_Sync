const WardrobeItem = require('../models/WardrobeItem');

const getWardrobeItems = async (req, res) => {
  try {
    const items = await WardrobeItem.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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
