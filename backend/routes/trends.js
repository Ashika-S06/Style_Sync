const express = require('express');
const router = express.Router();
const { analyzeTrendsAndRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/', protect, analyzeTrendsAndRecommendations);

module.exports = router;
