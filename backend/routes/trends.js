const express = require('express');
const router = express.Router();
const { analyzeTrendsAndRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// @route   GET /api/trends
// @desc    Get live trends and recommendations based on lookbooks and feedback
// @access  Private
router.get('/', protect, analyzeTrendsAndRecommendations);

module.exports = router;
