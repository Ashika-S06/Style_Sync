const Collection = require('../models/Collection');

const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.id }).populate('items').sort({ createdAt: -1 });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createCollection = async (req, res) => {
  try {
    const { name, items } = req.body;
    
    const collection = await Collection.create({
      user: req.user.id,
      name,
      items: items || []
    });
    
    res.status(201).json(collection);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create collection', error: error.message });
  }
};

const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    if (collection.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedCollection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('items');
    res.json(updatedCollection);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update collection' });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    if (collection.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await collection.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection
};
