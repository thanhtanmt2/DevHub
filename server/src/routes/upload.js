const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadCV } = require('../middleware/upload');

// POST /api/upload/cv
router.post('/cv', protect, uploadCV.single('cv'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn file CV để tải lên' });
  }

  // Construct URL
  const fileUrl = `/uploads/cvs/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size
    }
  });
});

module.exports = router;
