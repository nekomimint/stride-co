const express = require('express');
const router = express.Router();

const controller = require('../controllers/variants');

/* POST variant create*/
router.post('/', controller.create);

/* GET variant listing. */
router.get('/', controller.list);

/*GEt variant by id */
router.get('/:id', controller.find);

/*Put variant to update */
router.put('/:id', controller.update);

/*DELETE variant by id*/
router.delete('/:id', controller.destroy);

module.exports = router;