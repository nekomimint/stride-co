const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/customers');

const authorize = require('../middlewares/authorize');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
next();
};

//POST customers create (CREATE ANY - Admin y sales) 
router.post('/', authorize('customers', 'create', 'any'), log('Creating customer'), controller.create);

// GET customers listing (READ ANY - Admin y sales)
router.get('/', authorize('customers', 'read', 'any'), log('Listing customers'), controller.list);

//GET customers by id (READ OWN - Ver cliente propio) 
router.get('/:id', authorize('customers', 'read', 'own'), log('Searching customer by id'), controller.find);

// PUT customers to update (UPDATE OWN - Editar cliente propio)
router.put('/:id', authorize('customers', 'update', 'own'), log('Updating customer'), controller.update);

// DELETE customers by id (DELETE ANY - Solo admin) 
router.delete('/:id', authorize('customers', 'delete', 'any'), log('Deleting customer'), controller.destroy);

module.exports = router;