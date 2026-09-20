const express = require('express');
const router = express.Router();

const controller = require('../controllers/orders');

/* POST orders create*/
router.post('/', controller.create);

/* GET orders listing. */
router.get('/', controller.list);

/*GEt orders by id */
router.get('/:id', controller.find);

/*Put orders to update */
router.put('/:id', controller.update);

/*DELETE orders by id*/
router.delete('/:id', controller.destroy);

module.exports = router;