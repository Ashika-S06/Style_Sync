const express = require('express');
const router = express.Router();
const { getPersonalRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// @route   GET /api/recommendations
// @desc    Get personal recommendations based on user wardrobe
// @access  Private
router.get('/', protect, getPersonalRecommendations);

module.exports = router;
