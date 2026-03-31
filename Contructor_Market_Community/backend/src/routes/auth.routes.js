const express = require('express');
const { registrar, login, perfil } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas Públicas
router.post('/register', registrar);
router.post('/login', login);

// Rutas Protegidas (Requieren token)
router.get('/me', verificarToken, perfil);

module.exports = router;
