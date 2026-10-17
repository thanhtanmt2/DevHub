const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { uploadCV, uploadImage, uploadTaskFile } = require('../middleware/upload');

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

// POST /api/upload/image
router.post('/image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn hình ảnh để tải lên' });
  }

  const fileUrl = `/uploads/images/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      url: fileUrl,
      filename: req.file.originalname
    }
  });
});

// POST /api/upload/task-file — file sản phẩm nộp cho task (tối đa 20MB)
router.post('/task-file', protect, (req, res) => {
  uploadTaskFile.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File vượt quá dung lượng cho phép (tối đa 20MB)' : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file để tải lên' });
    }
    // Giữ tên gốc trong query ?name= để hiển thị/tải về đúng tên (file lưu trên đĩa dùng tên an toàn)
    const originalName = req.file.originalname.slice(0, 150);
    res.json({
      success: true,
      data: {
        url: `/uploads/tasks/${req.file.filename}?name=${encodeURIComponent(originalName)}`,
        filename: originalName,
        size: req.file.size
      }
    });
  });
});

module.exports = router;
