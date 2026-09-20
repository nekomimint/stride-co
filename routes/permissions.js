const express = require('express');
const router = express.Router();
const controller = require('../controllers/permissions');

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.find);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;