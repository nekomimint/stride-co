const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/variants');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};


/* POST variant create*/
router.post('/', log('Creating variant'), controller.create);

/* GET variant listing. */
router.get('/', log('Listing variants'), controller.list);

/*GEt variant by id */
router.get('/:id', log('Searching variant by id'), controller.find);

/*Put variant to update */
router.put('/:id', log('Updating variant'), controller.update);

/*DELETE variant by id*/
router.delete('/:id', log('Deleting variant'), controller.destroy);

module.exports = router;