const express = require('express');
const router = express.Router();
const { getPersonalRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPersonalRecommendations);

module.exports = router;
