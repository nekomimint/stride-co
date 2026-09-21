const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/inventory');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST inventory create*/
router.post('/', log('Creating inventory'), controller.create);

/* GET inventory listing. */
router.get('/', log('listing inventories'), controller.list);

/*GEt inventory by id */
router.get('/:id', log('Searching inventory by id'), controller.find);

/*Put inventory to update */
router.put('/:id', log('Updating inventory'), controller.update);

/*DELETE inventory by id*/
router.delete('/:id', log('Deleting inventory'), controller.destroy);

module.exports = router;