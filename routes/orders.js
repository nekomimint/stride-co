const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/orders');

const authorize = require('../middlewares/authorize');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST order create (CREATE ANY) */
router.post('/', authorize('orders', 'create', 'any'), log('Creating order'), controller.create);

/* GET order listing (READ ANY - Ver todas las órdenes) */
router.get('/', authorize('orders', 'read', 'any'), log('Listing orders'), controller.list);

/* GET order by id (READ OWN - Ver orden propia) */
router.get('/:id', authorize('orders', 'read', 'own'), log('Searching order by id'), controller.find);

/* PUT order to update (UPDATE OWN - Editar orden propia) */
router.put('/:id', authorize('orders', 'update', 'own'), log('Updating order'), controller.update);

/*DELETE orders by id*/
//router.delete('/:id', log('Deleting order'), controller.destroy);

module.exports = router;