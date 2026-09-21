const express = require('express');
const router = express.Router();
const controller = require('../controllers/permissions');
const logger = require('../utils/logger');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST permissions create*/
router.post('/', log('Creating permission'), controller.create);

/* GET permissions listing. */
router.get('/', log('Listing permissions'), controller.list);

/*GEt permisions by id */
router.get('/:id', log('Searching permission by id'), controller.find);

/*Put permissions to update */
router.put('/:id', log('Updating permission'), controller.update);

/*DELETE permissions by id*/
router.delete('/:id', log('Deleting permission'), controller.destroy);

module.exports = router;