const express = require('express');
const router = express.Router();

const controller = require('../controllers/inventory');

/* POST inventory create*/
router.post('/', controller.create);

/* GET inventory listing. */
router.get('/', controller.list);

/*GEt inventory by id */
router.get('/:id', controller.find);

/*Put inventory to update */
router.put('/:id', controller.update);

/*DELETE inventory by id*/
router.delete('/:id', controller.destroy);

module.exports = router;