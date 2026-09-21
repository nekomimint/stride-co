var express = require('express');
var router = express.Router();
const logger = require('../utils/logger');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  logger.info('Program has started');
});

module.exports = router;
