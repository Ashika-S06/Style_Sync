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
const path = require('path');

// Multer config for local storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

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
