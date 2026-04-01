const Lookbook = require('../models/Lookbook');

// @desc    Create lookbook
// @route   POST /api/lookbooks
// @access  Private
const createLookbook = async (req, res) => {
  try {
    const { title, description, tags, image, items } = req.body;
    // req.user is set by auth middleware
    const lookbook = await Lookbook.create({
      user: req.user.id,
      title,
      description,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
      items: items || [],
      image: req.file ? '/uploads/' + req.file.filename : (image || '')
    });
    const populated = await Lookbook.findById(lookbook._id).populate('user', 'username profilePic').populate('items');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create lookbook', error: error.message });
  }
};

// @desc    Get all lookbooks
// @route   GET /api/lookbooks
// @access  Public
const getLookbooks = async (req, res) => {
  try {
    const lookbooks = await Lookbook.find()
      .populate('user', 'username profilePic')
      .populate('items')
      .sort({ createdAt: -1 });
    res.json(lookbooks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single lookbook
// @route   GET /api/lookbooks/:id
// @access  Public
const getLookbookById = async (req, res) => {
  try {
    const lookbook = await Lookbook.findById(req.params.id)
      .populate('user', 'username profilePic')
      .populate('comments.user', 'username profilePic');
    if (lookbook) {
      res.json(lookbook);
    } else {
      res.status(404).json({ message: 'Lookbook not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update lookbook
// @route   PUT /api/lookbooks/:id
// @access  Private
const updateLookbook = async (req, res) => {
  try {
    const lookbook = await Lookbook.findById(req.params.id);
    if (!lookbook) {
      return res.status(404).json({ message: 'Lookbook not found' });
    }
    // Check for user ownership
    if (lookbook.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedLookbook = await Lookbook.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedLookbook);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update' });
  }
};

// @desc    Delete lookbook
// @route   DELETE /api/lookbooks/:id
// @access  Private
const deleteLookbook = async (req, res) => {
  try {
    const lookbook = await Lookbook.findById(req.params.id);
    if (!lookbook) {
      return res.status(404).json({ message: 'Lookbook not found' });
    }
    // Check ownership
    if (lookbook.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await lookbook.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like a lookbook
// @route   POST /api/lookbooks/:id/like
// @access  Private
const likeLookbook = async (req, res) => {
  try {
    const lookbook = await Lookbook.findById(req.params.id);
    if (!lookbook) {
      return res.status(404).json({ message: 'Lookbook not found' });
    }
    // Check if liked
    if (lookbook.likes.includes(req.user.id)) {
      lookbook.likes = lookbook.likes.filter(id => id.toString() !== req.user.id);
    } else {
      lookbook.likes.push(req.user.id);
    }
    await lookbook.save();
    res.json(lookbook.likes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Comment on lookbook
// @route   POST /api/lookbooks/:id/comment
// @access  Private
const commentLookbook = async (req, res) => {
  try {
    const lookbook = await Lookbook.findById(req.params.id);
    if (!lookbook) {
      return res.status(404).json({ message: 'Lookbook not found' });
    }
    
    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    lookbook.comments.push(comment);
    await lookbook.save();
    
    // re-populate before returning
    const populated = await Lookbook.findById(req.params.id).populate('comments.user', 'username profilePic');
    res.json(populated.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createLookbook,
  getLookbooks,
  getLookbookById,
  updateLookbook,
  deleteLookbook,
  likeLookbook,
  commentLookbook
};
