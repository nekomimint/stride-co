const express = require('express');
const router = express.Router();

const controller = require('../controllers/customers');

/* POST customers create*/
router.post('/', controller.create);

/* GET costumers listing. */
router.get('/', controller.list);

/*GEt costumers by id */
router.get('/:id', controller.find);

/*Put customers to update */
router.put('/:id', controller.update);

/*DELETE customers by id*/
router.delete('/:id', controller.destroy);

module.exports = router;