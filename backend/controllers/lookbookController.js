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
    const populated = await Lookbook.findById(lookbook._id).populate('user', 'username profilePic').populate('items').populate('comments.user', 'username profilePic');
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
    const lookbooks = await Lookbook.find({ isDeleted: { $ne: true } })
      .populate('user', 'username profilePic')
      .populate('items')
      .populate('comments.user', 'username profilePic')
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
    
    lookbook.isDeleted = true;
    await lookbook.save();
    res.json({ id: req.params.id, message: 'Lookbook soft deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Rate a lookbook
// @route   POST /api/lookbooks/:id/rate
// @access  Private
const rateLookbook = async (req, res) => {
  try {
    const { score } = req.body;
    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }
    const lookbook = await Lookbook.findById(req.params.id);
    if (!lookbook) {
      return res.status(404).json({ message: 'Lookbook not found' });
    }
    const existingRating = lookbook.ratings.find(r => r.user.toString() === req.user.id);
    if (existingRating) {
      existingRating.score = score;
    } else {
      lookbook.ratings.push({ user: req.user.id, score });
    }
    await lookbook.save();
    res.json(lookbook.ratings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Answer would wear for a lookbook
// @route   POST /api/lookbooks/:id/wear
// @access  Private
const wearLookbook = async (req, res) => {
  try {
    const { answer } = req.body;
    const lookbook = await Lookbook.findById(req.params.id);
    if (!lookbook) {
      return res.status(404).json({ message: 'Lookbook not found' });
    }
    const existingAnswer = lookbook.wouldWear.find(w => w.user.toString() === req.user.id);
    if (existingAnswer) {
      existingAnswer.answer = answer;
    } else {
      lookbook.wouldWear.push({ user: req.user.id, answer });
    }
    await lookbook.save();
    res.json(lookbook.wouldWear);
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
  rateLookbook,
  wearLookbook,
  commentLookbook
};
