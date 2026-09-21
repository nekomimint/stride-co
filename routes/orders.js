const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/orders');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST orders create*/
router.post('/', log('Creating order'), controller.create);

/* GET orders listing. */
router.get('/', log('Listing orders'), controller.list);

/*GEt orders by id */
router.get('/:id', log('Searching order by id'), controller.find);

/*Put orders to update */
router.put('/:id', log('Updating order'), controller.update);

/*DELETE orders by id*/
router.delete('/:id', log('Deleting order'), controller.destroy);

module.exports = router;