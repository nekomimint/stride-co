const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/customers');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST customers create*/
router.post('/', log('Creating customer'), controller.create);

/* GET costumers listing. */
router.get('/', log('Listing customers'), controller.list);

/*GEt costumers by id */
router.get('/:id', log('Searching customer by id'), controller.find);

/*Put customers to update */
router.put('/:id', log('Updating customer}'), controller.update);

/*DELETE customers by id*/
router.delete('/:id', log('Deleting customer'), controller.destroy);

module.exports = router;