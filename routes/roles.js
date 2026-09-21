const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/roles');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST role create*/
router.post('/', log('Creating role'), controller.create);

/* GET roles listing. */
router.get('/', log('Listing roles'), controller.list);

/*GEt role by id */
router.get('/:id', log('Searching role by id'), controller.find);

/*Put role to update */
router.put('/:id', log('Updating role'), controller.update);

/*DELETE role by id*/
router.delete('/:id', log('Deleting role'), controller.destroy);

module.exports = router;
