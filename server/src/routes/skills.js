const router = require('express').Router();
const { getPublicSkills } = require('../controllers/skillController');

router.get('/', getPublicSkills);

module.exports = router;
