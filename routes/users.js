const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/users');

const authorize = require('../middlewares/authorize');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

//* * POST user create (CREATE ANY) */
router.post('/', authorize('users', 'create', 'any'), log('Creating user'), controller.create);

// /* GET users listing (READ ANY - Ver todos los usuarios) */
router.get('/', authorize('users', 'read', 'any'), log('Listing users'), controller.list);

// /* GET user by id (READ OWN - Ver usuario propio) */
router.get('/:id', authorize('users', 'read', 'own'), log('Searching user by id'), controller.find);

// /* PUT user to update (UPDATE OWN - Editar usuario propio) */
router.put('/:id', authorize('users', 'update', 'own'), log('Updating user'), controller.update);

// /* DELETE user by id (DELETE ANY) */
router.delete('/:id', authorize('users', 'delete', 'any'), log('Deleting user'), controller.destroy);



// router.post('/', log('Creating user'), controller.create);

// /* GET users listing (READ ANY - Ver todos los usuarios) */
// router.get('/', log('Listing users'), controller.list);

// /* GET user by id (READ OWN - Ver usuario propio) */
// router.get('/:id', log('Searching user by id'), controller.find);

// /* PUT user to update (UPDATE OWN - Editar usuario propio) */
// router.put('/:id', log('Updating user'), controller.update);

// /* DELETE user by id (DELETE ANY) */
// router.delete('/:id', log('Deleting user'), controller.destroy);

module.exports = router;

