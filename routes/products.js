const express = require('express');
const router = express.Router();

const controller = require('../controllers/products');

/* POST product create*/
router.post('/', controller.create);

/* GET product listing. */
router.get('/', controller.list);

/*GEt product by id */
router.get('/:id', controller.find);

/*Put product to update */
router.put('/:id', controller.update);

/*DELETE product by id*/
router.delete('/:id', controller.destroy);

module.exports = router;
