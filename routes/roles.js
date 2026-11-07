const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/roles');

const authorize = require('../middlewares/authorize');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
next();
};

// solo el admin tiene permiso de acceder a estar rutas
// se requiere permiso any, permiso que solo el tiene asignado
router.post('/', authorize('roles', 'create', 'any'), log('Creating role'), controller.create);

router.get('/', authorize('roles', 'read', 'any'), log('Listing roles'), controller.list);

router.get('/:id', authorize('roles', 'read', 'any'), log('Searching role by id'), controller.find);

router.put('/:id', authorize('roles', 'update', 'any'), log('Updating role'), controller.update);

router.delete('/:id', authorize('roles', 'delete', 'any'), log('Deleting role'), controller.destroy);

module.exports = router;