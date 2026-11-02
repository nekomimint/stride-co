const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');
router.get('/', (req, res) => {
  res.json({ message: req.__('index.apiWorking') });
});
router.get('/health', controller.healthCheck);
module.exports = router;
