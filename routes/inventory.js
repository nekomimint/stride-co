const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/inventory');

const authorize = require('../middlewares/authorize');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
next();
};

/* POST inventory create (CREATE ANY - Solo admin) */
router.post('/', authorize('inventory', 'create', 'any'), log('Creating inventory'), controller.create);

/* GET inventory listing (READ ANY - Admin y sales) */
router.get('/', authorize('inventory', 'read', 'any'), log('listing inventories'), controller.list);

/* GET inventory by id (READ ANY - Admin y sales) */
router.get('/:id', authorize('inventory', 'read', 'any'), log('Searching inventory by id'), controller.find);

/* PUT inventory to update (UPDATE ANY - Solo admin) */
router.put('/:id', authorize('inventory', 'update', 'any'), log('Updating inventory'), controller.update);

/* DELETE inventory by id (DELETE ANY - Solo admin) */
router.delete('/:id', authorize('inventory', 'delete', 'any'), log('Deleting inventory'), controller.destroy);

module.exports = router;