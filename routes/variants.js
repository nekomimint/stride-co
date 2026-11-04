const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/variants');

const authorize = require('../middlewares/authorize');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
next();
};


/* POST variant create (CREATE ANY - Solo admin) */
router.post('/', authorize('variants', 'create', 'any'), log('Creating variant'), controller.create);

/* GET variant listing (READ ANY - Admin, sales y user) */
router.get('/', authorize('variants', 'read', 'any'), log('Listing variants'), controller.list);

/* GET variant by id (READ ANY - Admin, sales y user) */
router.get('/:id', authorize('variants', 'read', 'any'), log('Searching variant by id'), controller.find);

/* PUT variant to update (UPDATE ANY - Solo admin) */
router.put('/:id', authorize('variants', 'update', 'any'), log('Updating variant'), controller.update);

/* DELETE variant by id (DELETE ANY - Solo admin) */
router.delete('/:id', authorize('variants', 'delete', 'any'), log('Deleting variant'), controller.destroy);

module.exports = router;