const express = require('express');
const router = express.Router();
const controller = require('../controllers/permissions');
const logger = require('../utils/logger');

const authorize = require('../middlewares/authorize');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
next();
};


// solo el admin tiene el permiso de any, solo el le puede mover aqui
router.post('/', authorize('permissions', 'create', 'any'), log('Creating permission'), controller.create);

router.get('/', authorize('permissions', 'read', 'any'), log('Listing permissions'), controller.list);

router.get('/:id', authorize('permissions', 'read', 'any'), log('Searching permission by id'), controller.find);

router.put('/:id', authorize('permissions', 'update', 'any'), log('Updating permission'), controller.update);

router.delete('/:id', authorize('permissions', 'delete', 'any'), log('Deleting permission'), controller.destroy);

module.exports = router;