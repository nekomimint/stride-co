const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/products');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST product create*/
router.post('/', log('Creating product'), controller.create);

/* GET product listing. */
router.get('/', log('Listing products'), controller.list);

/*GEt product by id */
router.get('/:id', log('Searching product by id'), controller.find);

/*Put product to update */
router.put('/:id', log('Updating product'), controller.update);

/*DELETE product by id*/
router.delete('/:id', log('Deleting product'), controller.destroy);

module.exports = router;
