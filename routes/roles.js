const express = require('express');
const router = express.Router();

const controller = require('../controllers/roles');

/* POST role create*/
router.post('/', controller.create);

/* GET roles listing. */
router.get('/', controller.list);

/*GEt role by id */
router.get('/:id', controller.find);

/*Put role to update */
router.put('/:id', controller.update);

/*DELETE role by id*/
router.delete('/:id', controller.destroy);

module.exports = router;
