const express = require('express');
const router = express.Router();
const {
  getWardrobeItems,
  createWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem
} = require('../controllers/wardrobeController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
  .get(protect, getWardrobeItems)
  .post(protect, upload.single('image'), createWardrobeItem);

router.route('/:id')
  .put(protect, updateWardrobeItem)
  .delete(protect, deleteWardrobeItem);

module.exports = router;
