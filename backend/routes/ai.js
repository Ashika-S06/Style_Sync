const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// @route   POST api/ai/generate-lookbook
// @desc    Generate a lookbook outfit using Gemini
// @access  Private
router.post('/generate-lookbook', protect, aiController.generateLookbook);

module.exports = router;
