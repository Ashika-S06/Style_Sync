const express = require('express');
const router = express.Router();
const { 
  createLookbook, 
  getLookbooks, 
  getLookbookById, 
  updateLookbook, 
  deleteLookbook, 
  rateLookbook, 
  wearLookbook,
  commentLookbook 
} = require('../controllers/lookbookController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
  .get(getLookbooks)
  .post(protect, upload.single('image'), createLookbook);

router.route('/:id')
  .get(getLookbookById)
  .put(protect, updateLookbook)
  .delete(protect, deleteLookbook);

router.post('/:id/rate', protect, rateLookbook);
router.post('/:id/wear', protect, wearLookbook);
router.post('/:id/comment', protect, commentLookbook);

module.exports = router;
