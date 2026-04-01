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
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.route('/')
  .get(protect, getWardrobeItems)
  .post(protect, upload.single('image'), createWardrobeItem);

router.route('/:id')
  .put(protect, updateWardrobeItem)
  .delete(protect, deleteWardrobeItem);

module.exports = router;
