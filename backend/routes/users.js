const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public (or protected if preferred)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
