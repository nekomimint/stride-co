const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const controller = require('../controllers/users');

const log = (message)=>(req, res, next)=>{
    logger.info(message);
    next();
};

/* POST user create*/
router.post('/', log('Creating user'), controller.create);

/* GET users listing. */
router.get('/', log('Listing users'), controller.list);

/*GEt user by id */
router.get('/:id', log('Searching user by id'), controller.find);

/*Put user to update */
router.put('/:id', log('Updating user'), controller.update);

/*DELETE user by id*/
router.delete('/:id', log('Deleting user'), controller.destroy);

module.exports = router;
