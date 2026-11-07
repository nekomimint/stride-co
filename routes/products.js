const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/products');

//Importamos el middleware
const authorize = require('../middlewares/authorize');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST product create (CREATE ANY - Solo Admin) */
router.post('/', authorize('products', 'create', 'any'), log('Creating product'), controller.create);

/* GET product listing (READ ANY - Público / Todos) */
router.get('/', authorize('products', 'read', 'any'), log('Listing products'), controller.list);

/* GET product by id (READ ANY) */
router.get('/:id', authorize('products', 'read', 'any'), log('Searching product by id'), controller.find);

/* PUT product to update (UPDATE ANY - Solo Admin) */
router.put('/:id', authorize('products', 'update', 'any'), log('Updating product'), controller.update);

/* DELETE product by id (DELETE ANY - Solo Admin) */
router.delete('/:id', authorize('products', 'delete', 'any'), log('Deleting product'), controller.destroy);

module.exports = router;
