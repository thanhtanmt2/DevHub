const router = require('express').Router();
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/:id', (req, res) => res.json({ success: true, data: null, message: 'Task placeholder' }));

module.exports = router;
