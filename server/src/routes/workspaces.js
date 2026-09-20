const router = require('express').Router();
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/:id', (req, res) => res.json({ success: true, data: null, message: 'Workspace placeholder' }));

module.exports = router;
