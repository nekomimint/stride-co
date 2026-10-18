const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth');

router.post('/login', controller.login);

// agremamos el endpoint para el usuario autenticado
router.get('/me', controller.getMe);


module.exports = router;

